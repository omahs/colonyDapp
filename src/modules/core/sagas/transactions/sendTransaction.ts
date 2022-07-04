import { call, put, take } from 'redux-saga/effects';
import { Contract } from 'ethers';
import { TransactionResponse } from 'ethers/providers';
import { BigNumberish, splitSignature } from 'ethers/utils';
import { soliditySha3 } from 'web3-utils';
import {
  ContractClient,
  TransactionOverrides,
  Network,
  ClientType,
} from '@colony/colony-js';
import abis from '@colony/colony-js/lib-esm/abis';
import { hexSequenceNormalizer } from '@purser/core';

import { ActionTypes } from '~redux/index';
import { selectAsJS } from '~utils/saga/effects';
import { mergePayload } from '~utils/actions';
import {
  TRANSACTION_STATUSES,
  TRANSACTION_METHODS,
  TransactionRecord,
} from '~immutable/index';
import { ContextModule, TEMP_getContext } from '~context/index';
import { Action } from '~redux/types/actions';
import { ExtendedReduxContext, MethodParams } from '~types/index';
import { DEFAULT_NETWORK } from '~constants';

import { transactionSendError } from '../../actionCreators';
import { oneTransaction } from '../../selectors';

import transactionChannel from './transactionChannel';

/*
 * Given a method and a transaction record, create a promise for sending the
 * transaction with the method.
 */
async function getTransactionMethodPromise(
  // @TODO this is not great but I feel like we will replace this anyways at some point
  client: ContractClient,
  tx: TransactionRecord,
): Promise<TransactionResponse> {
  const {
    methodName,
    options: {
      gasLimit: gasLimitOverride,
      gasPrice: gasPriceOverride,
      ...restOptions
    },
    params,
    gasLimit,
    gasPrice,
  } = tx;
  const sendOptions: TransactionOverrides = {
    gasLimit: gasLimitOverride || gasLimit,
    gasPrice: gasPriceOverride || gasPrice,
    ...restOptions,
  };
  return client[methodName](...[...params, sendOptions]);
}

async function getMetatransactionMethodPromise(
  client: ContractClient,
  { methodName, params, identifier: colonyAddress }: TransactionRecord,
): Promise<TransactionResponse> {
  const wallet = TEMP_getContext(ContextModule.Wallet);
  const colonyManager = TEMP_getContext(ContextModule.ColonyManager);
  const { networkClient } = colonyManager;
  const { address: userAddress } = wallet;

  let normalizedMethodName: string = methodName;
  let normalizedClient: ContractClient = client;
  let normalizedParams: MethodParams = params;

  switch (methodName) {
    /*
     * For metatransactions we have to use the DeployTokenViaNetwork method
     */
    case TRANSACTION_METHODS.DeployToken:
      normalizedMethodName = TRANSACTION_METHODS.DeployTokenViaNetwork;
      break;
    /*
     * DeployTokenAuthority is not available on the contracts in normal circumstances (we add it via colonyJS)
     * But with metatransactions, it exits, but on a different client, with different params
     * So we have to do this ugly switch-aroo just to make the different api happy :(
     */
    case TRANSACTION_METHODS.DeployTokenAuthority: {
      normalizedClient = networkClient;
      const [tokenAddress, allowedToTransfer] = params;
      normalizedParams = [
        tokenAddress,
        colonyAddress as string,
        allowedToTransfer,
      ];
      break;
    }
    default:
      break;
  }

  const { provider } = normalizedClient;

  /*
   * If we're using a contract that's not really a contract, like TokenClient
   * (which is a client we added in colonyJS), which doesn't have a getMetatransactionNonce call
   * we need to make sure to always get a nonce.
   *
   * For this, if the client we're going to query doesn't have such a call, then we
   * fall back to fetching that value from the colony client
   */
  let availableNonce: BigNumberish;
  try {
    availableNonce = await normalizedClient.getMetatransactionNonce(
      userAddress,
    );
  } catch (error) {
    throw new Error(
      `Contract does not support MetaTransactions. ${normalizedClient?.clientType} at ${normalizedClient?.address}`,
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    'Transaction to send',
    normalizedClient.clientType,
    normalizedMethodName,
    params,
  );

  /*
   * All the 'WithProofs' helpers don't really exist on chain, so we have to
   * make sure we are calling the on-chain method, rather than our own helper
   *
   * @TODO This needs to handle cases where the method is "withProofs", but
   * since we can't encode with that helper, we'll have to either find a way around this
   * or just re-provide proofs (none of which is ideal)
   */
  const encodedTransaction = await normalizedClient.interface.functions[
    normalizedMethodName
  ].encode([...normalizedParams]);

  // eslint-disable-next-line no-console
  console.log('Encoded transaction', encodedTransaction);

  const { chainId: currentNetworkChainId } = await provider.getNetwork();
  let chainId = currentNetworkChainId;
  if (DEFAULT_NETWORK === Network.Local) {
    /*
     * Due to ganache internals shannanigans, when on the local ganache network
     * we must use chainId 1, otherwise the broadcaster (and the underlying contracts)
     * wont't be able to verify the signature (due to a chainId miss-match)
     *
     * This issue is only valid for ganache networks, as in production the chain id
     * is returned properly
     */
    chainId = 1;
  }

  const message = soliditySha3(
    { t: 'uint256', v: availableNonce.toString() },
    { t: 'address', v: normalizedClient.address },
    { t: 'uint256', v: chainId },
    { t: 'bytes', v: encodedTransaction },
  ) as string;

  // eslint-disable-next-line no-console
  console.log('Transaction message', message);

  const messageBuffer = Buffer.from(
    hexSequenceNormalizer(message, false),
    'hex',
  );

  const convertedBufferMessage = Array.from(messageBuffer);
  /*
   * Purser validator expects either a string or a Uint8Array. We convert this
   * to a an array to make Metamask happy when signing the buffer.
   *
   * So in order to actually pass validation, both for Software and Metamask
   * wallets we need to "fake" the array as actually being a Uint.
   *
   * Note this not affect the format of the data passed in to be signed,
   * or the signature.
   */
  convertedBufferMessage.constructor = Uint8Array;

  // eslint-disable-next-line no-console
  console.log('Actual signature converted Buffer', convertedBufferMessage);

  const metatransactionSignature = await wallet.signMessage({
    messageData: (convertedBufferMessage as unknown) as Uint8Array,
  });

  // eslint-disable-next-line no-console
  console.log('Signature', metatransactionSignature);

  const { r, s, v } = splitSignature(metatransactionSignature);

  const broadcastData = JSON.stringify({
    target: normalizedClient.address,
    payload: encodedTransaction,
    userAddress,
    r,
    s,
    v,
  });

  // eslint-disable-next-line no-console
  console.log('Broadcast data', broadcastData);

  const response = await fetch(
    `${process.env.BROADCASTER_ENDPOINT}/broadcast`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: broadcastData,
    },
  );
  const {
    message: responseErrorMessage,
    status: reponseStatus,
    data: responseData,
  } = await response.json();

  // eslint-disable-next-line no-console
  console.log(
    'Response data',
    responseErrorMessage,
    reponseStatus,
    responseData,
  );

  if (reponseStatus !== 'success') {
    throw new Error(
      responseErrorMessage?.reason ||
        responseErrorMessage ||
        responseData?.payload,
    );
  }

  return {
    hash: responseData.txHash,
  } as TransactionResponse;
}

export default function* sendTransaction({
  meta: { id },
}: Action<ActionTypes.TRANSACTION_SEND>) {
  const transaction: TransactionRecord = yield selectAsJS(oneTransaction, id);

  const {
    status,
    context,
    identifier,
    metatransaction,
    methodName,
  } = transaction;

  if (status !== TRANSACTION_STATUSES.READY) {
    throw new Error('Transaction is not ready to send.');
  }
  const colonyManager = TEMP_getContext(ContextModule.ColonyManager);

  let contextClient: ContractClient;
  if (context === ClientType.TokenClient) {
    contextClient = yield colonyManager.getTokenClient(identifier as string);
  } else if (context === ClientType.TokenLockingClient) {
    contextClient = yield colonyManager.getTokenLockingClient(
      identifier as string,
    );
  } else if (
    metatransaction &&
    methodName === TRANSACTION_METHODS.DeployTokenAuthority
  ) {
    contextClient = colonyManager.networkClient;
  } else if (
    context === ((ExtendedReduxContext.WrappedToken as unknown) as ClientType)
  ) {
    // @ts-ignore
    const wrappedTokenAbi = abis.WrappedToken.default.abi;
    contextClient = new Contract(
      identifier || '',
      wrappedTokenAbi,
      colonyManager.signer,
    );
  } else if (
    context === ((ExtendedReduxContext.VestingSimple as unknown) as ClientType)
  ) {
    // @ts-ignore
    const vestingSimpleAbi = abis.vestingSimple.default.abi;
    contextClient = new Contract(
      identifier || '',
      vestingSimpleAbi,
      colonyManager.signer,
    );
  } else {
    contextClient = yield colonyManager.getClient(context, identifier);
  }

  if (!contextClient) {
    throw new Error('Context client failed to instantiate');
  }

  const promiseMethod = metatransaction
    ? getMetatransactionMethodPromise
    : getTransactionMethodPromise;

  /*
   * @NOTE Create a promise to send the transaction with the given method.
   *
   * DO NOT! yield this method! Otherwise the error we're throwing inside
   * `getMetatransactionMethodPromise` based on the broadcaster's response message
   * will not catch, so the UI will not properly display it in the Gas Station
   */
  const txPromise = promiseMethod(contextClient, transaction);

  const channel = yield call(
    transactionChannel,
    txPromise,
    transaction,
    contextClient,
  );

  try {
    while (true) {
      const action = yield take(channel);
      // Add the transaction to the payload (we need to get the most recent version of it)
      const currentTransaction = yield selectAsJS(oneTransaction, id);

      // Put the action to the store
      yield put(mergePayload({ transaction: currentTransaction })(action));
    }
  } catch (error) {
    console.error(error);
    yield put(transactionSendError(id, error));
  } finally {
    channel.close();
  }
}
