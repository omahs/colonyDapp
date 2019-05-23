/* @flow */

import type { Channel, Saga } from 'redux-saga';

import {
  all,
  call,
  delay,
  fork,
  put,
  takeEvery,
  takeLatest,
  select,
} from 'redux-saga/effects';

import type { Action } from '~redux';
import type { TxConfig } from '../../core/types';

import {
  putError,
  takeFrom,
  executeCommand,
  executeQuery,
  selectAsJS,
  putNotification,
} from '~utils/saga/effects';
import { getNormalizedDomainText } from '~utils/strings';
import { ACTIONS } from '~redux';
import { CONTEXT, getContext } from '~context';

import {
  createColonyProfile,
  removeColonyAvatar,
  setColonyAvatar,
  updateColonyProfile,
} from '../data/commands';

import { createUserProfile } from '../../users/data/commands';

import {
  getColony,
  getColonyCanMintNativeToken,
  getColonyTasks,
  getColonyTokenBalance,
} from '../data/queries';

import {
  transactionAddParams,
  transactionAddIdentifier,
  transactionReady,
} from '../../core/actionCreators';
import {
  createTransaction,
  getTxChannel,
  createTransactionChannels,
} from '../../core/sagas';
import { ipfsUpload } from '../../core/sagas/ipfs';
import {
  COLONY_CONTEXT,
  NETWORK_CONTEXT,
  TOKEN_CONTEXT,
} from '../../core/constants';
import { networkVersionSelector } from '../../core/selectors';

import {
  currentUserSelector,
  walletAddressSelector,
} from '../../users/selectors';
import { subscribeToColony } from '../../users/actionCreators';
import { userDidClaimProfile } from '../../users/checks';

import { fetchColony, fetchToken } from '../actionCreators';
import { colonyAvatarHashSelector } from '../selectors';
import { getColonyAddress, getColonyName } from './shared';

import { NOTIFICATION_EVENT_COLONY_ENS_CREATED } from '~users/Inbox/events';

function* colonyCreate({
  meta,
  payload: {
    colonyName: givenColonyName,
    displayName,
    tokenAddress: givenTokenAddress,
    tokenChoice,
    tokenIcon,
    tokenName,
    tokenSymbol,
    username,
  },
}: Action<typeof ACTIONS.COLONY_CREATE>): Saga<void> {
  /*
   * Get the current user's wallet address (needed for notifications).
   */
  const walletAddress = yield select(walletAddressSelector);
  const currentUser = yield* selectAsJS(currentUserSelector);
  const colonyName = yield call(getNormalizedDomainText, givenColonyName);
  if (!colonyName) throw new Error(`Invalid colonyName '${givenColonyName}'`);

  /*
   * Define a manifest of transaction ids and their respective channels.
   */
  const channels: {
    [id: string]: {| channel: Channel<*>, index: number, id: string |},
  } = yield call(createTransactionChannels, meta.id, [
    /*
     * If the user did not claim a profile yet, define a tx to create the user.
     */
    ...(!userDidClaimProfile(currentUser) ? ['createUser'] : []),
    /*
     * If the user opted to create a token, define a tx to create the token.
     */
    ...(tokenChoice === 'create' ? ['createToken'] : []),
    /*
     * Always create the following transactions..
     */
    'createColony',
    'createLabel',
    /*
     * If the user opted to create a token, define txs to manage the token.
     */
    ...(tokenChoice === 'create'
      ? ['deployTokenAuthority', 'setTokenAuthority']
      : []),
    /*
     * Always create the following transactions.
     */
    'deployOneTx',
    'setOneTxRole',
    'deployOldRoles',
    'setOldRolesRole',
  ]);
  const {
    createColony,
    createLabel,
    createToken,
    createUser,
    deployOldRoles,
    deployOneTx,
    deployTokenAuthority,
    setOldRolesRole,
    setOneTxRole,
    setTokenAuthority,
  } = channels;

  const createGroupedTransaction = (
    { id, index }: $Values<typeof channels>,
    config: TxConfig<*>,
  ) =>
    fork(createTransaction, id, {
      ...config,
      group: {
        key: 'transaction.batch.createColony',
        id: meta.id,
        index,
      },
    });

  /*
   * Create all transactions for the group.
   */
  try {
    if (createUser) {
      yield createGroupedTransaction(createUser, {
        context: NETWORK_CONTEXT,
        methodName: 'registerUserLabel',
        params: { username },
        ready: false,
      });

      const { profileStore, metadataStore, inboxStore } = yield* executeCommand(
        createUserProfile,
        {
          args: { username, walletAddress },
          metadata: { walletAddress },
        },
      );

      yield put<Action<typeof ACTIONS.USERNAME_CREATE_SUCCESS>>({
        type: ACTIONS.USERNAME_CREATE_SUCCESS,
        payload: {
          inboxStoreAddress: inboxStore.address.toString(),
          metadataStoreAddress: metadataStore.address.toString(),
          username,
        },
        meta,
      });
      yield put(
        transactionAddParams(createUser.id, {
          orbitDBPath: profileStore.address.toString(),
        }),
      );
      yield put(transactionReady(createUser.id));
    }

    if (createToken) {
      yield createGroupedTransaction(createToken, {
        context: NETWORK_CONTEXT,
        methodName: 'createToken',
        params: { name: tokenName, symbol: tokenSymbol, decimals: 18 },
      });
    }

    yield createGroupedTransaction(createColony, {
      context: NETWORK_CONTEXT,
      methodName: 'createColony',
      ready: false,
    });

    yield createGroupedTransaction(createLabel, {
      context: COLONY_CONTEXT,
      methodName: 'registerColonyLabel',
      params: { colonyName },
      ready: false,
    });

    if (createToken) {
      yield createGroupedTransaction(deployTokenAuthority, {
        context: TOKEN_CONTEXT,
        methodName: 'createTokenAuthority',
        params: { allowedToTransfer: [] },
        ready: false,
      });

      yield createGroupedTransaction(setTokenAuthority, {
        context: TOKEN_CONTEXT,
        methodName: 'setAuthority',
        ready: false,
      });
    }

    yield createGroupedTransaction(deployOneTx, {
      context: COLONY_CONTEXT,
      methodName: 'addExtension',
      params: { contractName: 'OneTxPayment' },
      ready: false,
    });

    yield createGroupedTransaction(setOneTxRole, {
      context: COLONY_CONTEXT,
      methodContext: 'setOneTxRole',
      methodName: 'setRootRole',
      params: { setTo: true },
      ready: false,
    });

    yield createGroupedTransaction(deployOldRoles, {
      context: COLONY_CONTEXT,
      methodName: 'addExtension',
      params: { contractName: 'OldRoles' },
      ready: false,
    });

    yield createGroupedTransaction(setOldRolesRole, {
      context: COLONY_CONTEXT,
      methodContext: 'setOldRolesRole',
      methodName: 'setRootRole',
      params: { setTo: true },
      ready: false,
    });

    /*
     * Wait until all transactions are created.
     */
    yield all(
      Object.keys(channels).map(id =>
        takeFrom(channels[id].channel, ACTIONS.TRANSACTION_CREATED),
      ),
    );

    /*
     * Dispatch a success action; this progresses to next wizard step,
     * where transactions can get processed.
     */
    yield put<Action<typeof ACTIONS.COLONY_CREATE_SUCCESS>>({
      type: ACTIONS.COLONY_CREATE_SUCCESS,
      meta,
      payload: undefined,
    });

    /*
     * For transactions that rely on the receipt/event data of previous transactions,
     * wait for these transactions to succeed, collect the data, and apply it to
     * the pending transactions.
     */
    let tokenAddress: string;
    if (createToken) {
      ({
        payload: {
          transaction: {
            receipt: { contractAddress: tokenAddress },
          },
        },
      } = yield takeFrom(createToken.channel, ACTIONS.TRANSACTION_SUCCEEDED));
    } else {
      if (!givenTokenAddress) {
        throw new Error('Token address not provided');
      }
      tokenAddress = givenTokenAddress;
    }

    /*
     * Pass through tokenAddress after token creation to the colony creation
     * transaction and wait for it to succeed.
     */
    yield put(transactionAddParams(createColony.id, { tokenAddress }));
    yield put(transactionReady(createColony.id));

    const {
      payload: {
        eventData: { colonyAddress },
      },
    } = yield takeFrom(createColony.channel, ACTIONS.TRANSACTION_SUCCEEDED);

    if (!colonyAddress) {
      yield putError(
        ACTIONS.COLONY_CREATE_ERROR,
        new Error('Missing colony address'),
        meta,
      );
    }

    /*
     * Create the colony store
     */
    const colonyStore = yield* executeCommand(createColonyProfile, {
      metadata: { colonyAddress },
      args: {
        colonyAddress,
        colonyName,
        displayName,
        token: {
          address: tokenAddress,
          iconHash: tokenIcon,
          isExternal: tokenChoice === 'select',
          isNative: true,
          name: tokenName,
          symbol: tokenSymbol,
        },
      },
    });

    yield put(subscribeToColony(colonyAddress));

    /*
     * Pass through colonyStore Address after colony store creation to colonyName creation
     */
    yield put(
      transactionAddParams(createLabel.id, {
        orbitDBPath: colonyStore.address.toString(),
      }),
    );

    /*
     * Add a colonyAddress identifier to all pending transactions.
     */
    yield all(
      [
        createLabel,
        deployTokenAuthority,
        setTokenAuthority,
        deployOneTx,
        setOneTxRole,
        deployOldRoles,
        setOldRolesRole,
      ]
        .filter(Boolean)
        .map(({ id }) => put(transactionAddIdentifier(id, colonyAddress))),
    );

    const colonyManager = yield* getContext(CONTEXT.COLONY_MANAGER);
    const colonyClient = yield call(
      [colonyManager, colonyManager.getColonyClient],
      colonyAddress,
    );

    /*
     * Create label
     */
    yield put(transactionReady(createLabel.id));
    yield takeFrom(createLabel.channel, ACTIONS.TRANSACTION_SUCCEEDED);

    if (deployTokenAuthority) {
      /*
       * Deploy TokenAuthority
       */
      yield put(
        transactionAddParams(deployTokenAuthority.id, {
          colonyAddress,
          tokenAddress,
        }),
      );
      yield put(transactionReady(deployTokenAuthority.id));
      const {
        payload: {
          transaction: {
            receipt: { contractAddress: tokenAuthorityAddress },
          },
        },
      } = yield takeFrom(
        deployTokenAuthority.channel,
        ACTIONS.TRANSACTION_SUCCEEDED,
      );

      /*
       * Set Token authority (to deployed TokenAuthority)
       */
      yield put(
        transactionAddParams(setTokenAuthority.id, {
          authority: tokenAuthorityAddress,
        }),
      );
      yield put(transactionReady(setTokenAuthority.id));
      yield takeFrom(setTokenAuthority.channel, ACTIONS.TRANSACTION_SUCCEEDED);
    }

    /*
     * Deploy OneTx
     */
    yield put(transactionReady(deployOneTx.id));
    yield takeFrom(deployOneTx.channel, ACTIONS.TRANSACTION_SUCCEEDED);
    const { address: oneTxAddress } = yield call(
      [colonyClient.getExtensionAddress, colonyClient.getExtensionAddress.call],
      { contractName: 'OneTxPayment' },
    );

    /*
     * Set OneTx role
     */
    yield put(transactionAddParams(setOneTxRole.id, { address: oneTxAddress }));
    yield put(transactionReady(setOneTxRole.id));
    yield takeFrom(setOneTxRole.channel, ACTIONS.TRANSACTION_SUCCEEDED);

    /*
     * Deploy OldRoles
     */
    yield put(transactionReady(deployOldRoles.id));
    yield takeFrom(deployOldRoles.channel, ACTIONS.TRANSACTION_SUCCEEDED);
    const { address: oldRolesAddress } = yield call(
      [colonyClient.getExtensionAddress, colonyClient.getExtensionAddress.call],
      { contractName: 'OldRoles' },
    );

    /*
     * Set OldRoles role
     */
    yield put(
      transactionAddParams(setOldRolesRole.id, {
        address: oldRolesAddress,
      }),
    );
    yield put(transactionReady(setOldRolesRole.id));
    yield takeFrom(setOldRolesRole.channel, ACTIONS.TRANSACTION_SUCCEEDED);

    /*
     * Notification
     */
    yield putNotification({
      colonyAddress,
      colonyName,
      event: NOTIFICATION_EVENT_COLONY_ENS_CREATED,
      sourceUserAddress: walletAddress,
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_CREATE_ERROR, error, meta);
  } finally {
    /*
     * Close all transaction channels.
     */
    yield all(
      Object.keys(channels).map(id =>
        call([channels[id].channel, channels[id].channel.close]),
      ),
    );
  }
}

function* colonyNameCheckAvailability({
  payload: { colonyName },
  meta,
}: Action<typeof ACTIONS.COLONY_NAME_CHECK_AVAILABILITY>): Saga<void> {
  try {
    yield delay(300);

    /**
     * @todo Define `getColonyAddress` query.
     * @body This should probably be a query at some point, like in `usernameCheckAvailability`.
     */
    const colonyAddress = yield call(getColonyAddress, colonyName);

    if (colonyAddress) {
      throw new Error('ENS address already exists');
    }

    yield put<Action<typeof ACTIONS.COLONY_NAME_CHECK_AVAILABILITY_SUCCESS>>({
      type: ACTIONS.COLONY_NAME_CHECK_AVAILABILITY_SUCCESS,
      meta,
      payload: undefined,
    });
  } catch (caughtError) {
    yield putError(
      ACTIONS.COLONY_NAME_CHECK_AVAILABILITY_ERROR,
      caughtError,
      meta,
    );
  }
}

function* colonyProfileUpdate({
  meta,
  payload: {
    colonyAddress,
    colonyName,
    description,
    displayName,
    guideline,
    website,
  },
}: Action<typeof ACTIONS.COLONY_PROFILE_UPDATE>): Saga<void> {
  try {
    yield* executeCommand(updateColonyProfile, {
      args: {
        description,
        displayName,
        guideline,
        website,
      },
      metadata: { colonyAddress },
    });

    yield put<Action<typeof ACTIONS.COLONY_PROFILE_UPDATE_SUCCESS>>({
      type: ACTIONS.COLONY_PROFILE_UPDATE_SUCCESS,
      meta,
      payload: {
        colonyAddress,
        colonyName,
        description,
        displayName,
        guideline,
        website,
      },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_PROFILE_UPDATE_ERROR, error, meta);
  }
}

function* colonyFetch({
  payload: { colonyAddress },
  meta,
}: Action<typeof ACTIONS.COLONY_FETCH>): Saga<void> {
  try {
    /**
     * @todo Add error mode for fetching a non-existent colony.
     */
    const payload = yield* executeQuery(getColony, {
      args: { colonyAddress },
      metadata: { colonyAddress },
    });
    yield put<Action<typeof ACTIONS.COLONY_FETCH_SUCCESS>>({
      type: ACTIONS.COLONY_FETCH_SUCCESS,
      meta,
      payload,
    });

    // dispatch actions to fetch info and balances for each colony token
    yield all(
      Object.keys(payload.tokens || {}).reduce(
        (effects, tokenAddress) => [
          ...effects,
          put(fetchToken(tokenAddress)),
          put<Action<typeof ACTIONS.COLONY_TOKEN_BALANCE_FETCH>>({
            type: ACTIONS.COLONY_TOKEN_BALANCE_FETCH,
            payload: { colonyAddress, tokenAddress },
          }),
        ],
        [],
      ),
    );

    // fetch whether the user is allowed to mint tokens via the colony
    yield put<Action<typeof ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH>>({
      type: ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH,
      meta: { key: colonyAddress },
      payload: { colonyAddress },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_FETCH_ERROR, error, meta);
  }
}

function* colonyAddressFetch({
  payload: { colonyName },
}: Action<typeof ACTIONS.COLONY_ADDRESS_FETCH>): Saga<void> {
  try {
    const colonyAddress = yield call(getColonyAddress, colonyName);

    if (!colonyAddress)
      throw new Error(`No Colony address found for ENS name "${colonyName}"`);

    yield put<Action<typeof ACTIONS.COLONY_ADDRESS_FETCH_SUCCESS>>({
      type: ACTIONS.COLONY_ADDRESS_FETCH_SUCCESS,
      meta: { key: colonyAddress },
      payload: { colonyAddress, colonyName },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_ADDRESS_FETCH_ERROR, error, { colonyName });
  }
}

function* colonyNameFetch({
  payload: { colonyAddress },
  meta,
}: Action<typeof ACTIONS.COLONY_NAME_FETCH>): Saga<void> {
  try {
    const colonyName = yield call(getColonyName, colonyAddress);
    if (!colonyName)
      throw new Error(
        `No Colony ENS name found for address "${colonyAddress}"`,
      );

    yield put<Action<typeof ACTIONS.COLONY_NAME_FETCH_SUCCESS>>({
      type: ACTIONS.COLONY_NAME_FETCH_SUCCESS,
      meta,
      payload: { colonyAddress, colonyName },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_NAME_FETCH_ERROR, error, meta);
  }
}

function* colonyAvatarUpload({
  meta,
  payload: { colonyAddress, data },
}: Action<typeof ACTIONS.COLONY_AVATAR_UPLOAD>): Saga<void> {
  try {
    // first attempt upload to IPFS
    const ipfsHash = yield call(ipfsUpload, data);

    /*
     * Set the avatar's hash in the store
     */
    yield* executeCommand(setColonyAvatar, {
      args: {
        ipfsHash,
      },
      metadata: { colonyAddress },
    });

    /*
     * Store the new avatar hash value in the redux store so we can show it
     */
    yield put<Action<typeof ACTIONS.COLONY_AVATAR_UPLOAD_SUCCESS>>({
      type: ACTIONS.COLONY_AVATAR_UPLOAD_SUCCESS,
      meta,
      payload: { hash: ipfsHash },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_AVATAR_UPLOAD_ERROR, error, meta);
  }
}

function* colonyAvatarRemove({
  meta,
  payload: { colonyAddress },
}: Action<typeof ACTIONS.COLONY_AVATAR_REMOVE>): Saga<void> {
  try {
    const ipfsHash = yield select(colonyAvatarHashSelector, colonyAddress);
    /*
     * Remove colony avatar
     */
    yield* executeCommand(removeColonyAvatar, {
      args: {
        ipfsHash,
      },
      metadata: { colonyAddress },
    });

    /*
     * Also set the avatar in the state to undefined (via a reducer)
     */
    yield put<Action<typeof ACTIONS.COLONY_AVATAR_REMOVE_SUCCESS>>({
      type: ACTIONS.COLONY_AVATAR_REMOVE_SUCCESS,
      meta,
      payload: undefined,
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_AVATAR_REMOVE_ERROR, error, meta);
  }
}

function* colonyRecoveryModeEnter({
  payload: { colonyAddress },
  meta,
}: Action<typeof ACTIONS.COLONY_RECOVERY_MODE_ENTER>) {
  const txChannel = yield call(getTxChannel, meta.id);

  try {
    yield fork(createTransaction, meta.id, {
      context: COLONY_CONTEXT,
      methodName: 'enterRecoveryMode',
      identifier: colonyAddress,
    });

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_CREATED);

    yield put({
      type: ACTIONS.COLONY_RECOVERY_MODE_ENTER_SUCCESS,
      meta,
    });

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_SUCCEEDED);

    yield put(fetchColony(colonyAddress));
  } catch (error) {
    yield putError(ACTIONS.COLONY_RECOVERY_MODE_ENTER_ERROR, error, meta);
  } finally {
    txChannel.close();
  }
}

function* colonyUpgradeContract({
  payload: { colonyAddress },
  meta,
}: Action<typeof ACTIONS.COLONY_VERSION_UPGRADE>) {
  const txChannel = yield call(getTxChannel, meta.id);

  const newVersion = yield select(networkVersionSelector);

  try {
    yield fork(createTransaction, meta.id, {
      context: COLONY_CONTEXT,
      methodName: 'upgrade',
      identifier: colonyAddress,
      params: { newVersion },
    });

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_CREATED);

    yield put({
      type: ACTIONS.COLONY_VERSION_UPGRADE_SUCCESS,
      meta,
    });

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_SUCCEEDED);

    yield put(fetchColony(colonyAddress));
  } catch (error) {
    yield putError(ACTIONS.COLONY_VERSION_UPGRADE_ERROR, error, meta);
  } finally {
    txChannel.close();
  }
}

function* colonyTokenBalanceFetch({
  payload: { colonyAddress, tokenAddress },
}: Action<typeof ACTIONS.COLONY_TOKEN_BALANCE_FETCH>) {
  try {
    const balance = yield* executeQuery(getColonyTokenBalance, {
      args: { colonyAddress, tokenAddress },
    });

    yield put({
      type: ACTIONS.COLONY_TOKEN_BALANCE_FETCH_SUCCESS,
      payload: {
        token: {
          address: tokenAddress,
          balance,
        },
        tokenAddress,
        colonyAddress,
      },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_TOKEN_BALANCE_FETCH_ERROR, error);
  }
}

/*
 * Given a colony address, dispatch actions to fetch all tasks
 * for that colony.
 */
function* colonyTaskMetadataFetch({
  meta,
  payload: { colonyAddress },
}: Action<typeof ACTIONS.COLONY_TASK_METADATA_FETCH>): Saga<void> {
  try {
    const colonyTasks = yield* executeQuery(getColonyTasks, {
      metadata: { colonyAddress },
    });
    yield put<Action<typeof ACTIONS.COLONY_TASK_METADATA_FETCH_SUCCESS>>({
      type: ACTIONS.COLONY_TASK_METADATA_FETCH_SUCCESS,
      meta: { key: colonyAddress },
      payload: { colonyAddress, colonyTasks },
    });
  } catch (error) {
    yield putError(ACTIONS.COLONY_TASK_METADATA_FETCH_ERROR, error, meta);
  }
}

function* colonyCanMintNativeTokenFetch({
  meta,
  payload: { colonyAddress },
}: Action<typeof ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH>): Saga<void> {
  try {
    const canMintNativeToken = yield* executeQuery(
      getColonyCanMintNativeToken,
      {
        metadata: { colonyAddress },
      },
    );
    yield put<
      Action<typeof ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH_SUCCESS>,
    >({
      type: ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH_SUCCESS,
      meta,
      payload: { canMintNativeToken, colonyAddress },
    });
  } catch (error) {
    yield putError(
      ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH_ERROR,
      error,
      meta,
    );
  }
}

function* colonyNativeTokenUnlock({
  meta,
  payload: { colonyAddress },
}: Action<typeof ACTIONS.COLONY_NATIVE_TOKEN_UNLOCK>): Saga<void> {
  const txChannel = yield call(getTxChannel, meta.id);

  try {
    yield fork(createTransaction, meta.id, {
      context: TOKEN_CONTEXT,
      methodName: 'unlock',
      identifier: colonyAddress,
    });

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_SUCCEEDED);

    yield put({
      type: ACTIONS.COLONY_NATIVE_TOKEN_UNLOCK_SUCCESS,
      meta,
    });

    yield put(fetchColony(colonyAddress));
  } catch (error) {
    yield putError(ACTIONS.COLONY_NATIVE_TOKEN_UNLOCK_ERROR, error, meta);
  } finally {
    txChannel.close();
  }
}

export default function* colonySagas(): Saga<void> {
  yield takeEvery(ACTIONS.COLONY_ADDRESS_FETCH, colonyAddressFetch);
  yield takeEvery(
    ACTIONS.COLONY_CAN_MINT_NATIVE_TOKEN_FETCH,
    colonyCanMintNativeTokenFetch,
  );
  yield takeEvery(ACTIONS.COLONY_CREATE, colonyCreate);
  yield takeEvery(ACTIONS.COLONY_FETCH, colonyFetch);
  yield takeEvery(ACTIONS.COLONY_NAME_FETCH, colonyNameFetch);
  yield takeEvery(ACTIONS.COLONY_NATIVE_TOKEN_UNLOCK, colonyNativeTokenUnlock);
  yield takeEvery(ACTIONS.COLONY_PROFILE_UPDATE, colonyProfileUpdate);
  yield takeEvery(ACTIONS.COLONY_RECOVERY_MODE_ENTER, colonyRecoveryModeEnter);
  yield takeEvery(ACTIONS.COLONY_TASK_METADATA_FETCH, colonyTaskMetadataFetch);
  yield takeEvery(ACTIONS.COLONY_TOKEN_BALANCE_FETCH, colonyTokenBalanceFetch);
  yield takeEvery(ACTIONS.COLONY_VERSION_UPGRADE, colonyUpgradeContract);
  /*
   * Note that the following actions use `takeLatest` because they are
   * dispatched on user keyboard input and use the `delay` saga helper.
   */
  yield takeLatest(ACTIONS.COLONY_AVATAR_REMOVE, colonyAvatarRemove);
  yield takeLatest(ACTIONS.COLONY_AVATAR_UPLOAD, colonyAvatarUpload);
  yield takeLatest(
    ACTIONS.COLONY_NAME_CHECK_AVAILABILITY,
    colonyNameCheckAvailability,
  );
}
