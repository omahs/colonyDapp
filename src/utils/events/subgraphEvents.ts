import {
  LogDescription,
  id as topicId,
  bigNumberify,
  hexlify,
} from 'ethers/utils';
import { ColonyRole } from '@colony/colony-js';

import { SubgraphEvent, SubgraphTransaction, SubgraphBlock } from '~data/index';
import { Address, ColonyAndExtensionsEvents } from '~types/index';

import { createAddress } from '../web3';

/*
 * Needed to omit the unused `decode()` function as well as add
 * information related to the transaction and block
 */
export type ExtendedLogDescription = Omit<LogDescription, 'decode'> & {
  timestamp?: number;
  blockNumber?: number;
  hash?: string;
  index?: string;
  name: ColonyAndExtensionsEvents;
  address: Address;
};

/*
 * Needed since the types auto generated by graphql don't account for prop
 * renaming in the queries, so they still expect there old names
 */
export type NormalizedSubgraphEvent = Omit<
  SubgraphEvent,
  'associatedColony' | 'processedValues'
> & {
  transaction?: SubgraphTransaction & {
    transactionHash?: string;
    block?: SubgraphBlock & {
      number?: string;
    };
  };
};

/*
 * @NOTE Only use internally
 *
 * Specific function to parse known, expected, values
 * This parses values for any known addresses
 */
const addressArgumentParser = (values: {
  user?: string;
  _user?: string;
  agent?: string;
  creator?: string;
  staker?: string;
  escalator?: string;
  recipient?: string;
  voter?: string;
  buyer?: string;
}): {
  user?: Address;
  _user?: Address;
  agent?: Address;
  creator?: Address;
  staker?: Address;
  escalator?: Address;
  recipient?: Address;
  voter?: Address;
  buyer?: Address;
} => {
  const parsedValues: {
    user?: Address;
    _user?: Address;
    agent?: Address;
    creator?: Address;
    staker?: Address;
    escalator?: Address;
    recipient?: Address;
    voter?: Address;
    buyer?: Address;
  } = {};
  [
    'user',
    '_user',
    'agent',
    'creator',
    'staker',
    'escalator',
    'recipient',
    'voter',
    'buyer',
  ].map((propName) => {
    if (values[propName]) {
      parsedValues[propName] = createAddress(values[propName]);
    }
    return null;
  });
  return parsedValues;
};

/*
 * @NOTE Only use internally
 *
 * Specific function to parse known, expected, values
 * This parses values for the ColonyRoleSet and RecoveryRoleSet events
 */
const roleArgumentParser = (values: {
  domainId?: string;
  role?: string;
  setTo?: string;
}): {
  domainId?: number;
  role?: ColonyRole;
  setTo?: boolean;
} => {
  const parsedValues: {
    domainId?: number;
    role?: ColonyRole;
    setTo?: boolean;
  } = {};
  if (values?.domainId) {
    parsedValues.domainId = parseInt(values.domainId, 10);
  }
  if (values?.role) {
    parsedValues.role = parseInt(values.role, 10);
  }
  if (values?.setTo) {
    /*
     * Apparently there's no better way to parse a boolean value from string...
     */
    parsedValues.setTo = values.setTo === 'true';
  }
  return parsedValues;
};

/*
 * @NOTE Only use internally
 *
 * Specific function to parse known, expected, values
 * This parses values for the Extension-related events
 */
const extensionArgumentParser = (values: {
  version?: string;
}): {
  version?: number;
} => {
  const parsedValues: {
    version?: number;
  } = {};
  if (values?.version) {
    parsedValues.version = parseInt(values.version, 10);
  }
  return parsedValues;
};

const motionArgumentparser = ({ amount, vote }) => {
  return {
    ...(amount ? { stakeAmount: bigNumberify(amount) } : {}),
    ...(vote ? { vote: Number(vote) } : {}),
  };
};

/*
 * @NOTE Only use internally
 *
 * Specific function to parse known, expected, values
 * This parses values for any event with storage slots
 */
const storageSlotArgumentParser = (values: {
  slot?: string;
}): {
  slot?: string;
} => {
  const parsedValues: {
    slot?: string;
  } = {};
  if (values?.slot) {
    parsedValues.slot = hexlify(parseInt(values.slot || '0', 10));
  }
  return parsedValues;
};

/*
 * @NOTE Only use internally
 *
 * Specific function to parse known, expected, values
 * This parses values for whitelist specific events
 */
const whitelistEventsArgumentParser = (values: {
  _status?: string;
}): {
  _status?: boolean;
} => {
  const parsedValues: {
    _status?: boolean;
  } = {};
  if (values?._status) {
    // eslint-disable-next-line no-underscore-dangle
    parsedValues._status = values._status === 'true';
  }
  return parsedValues;
};

/*
 * Utility to parse events that come from the subgraph handler
 * into events that resemble the Log format that we get directly from the chain
 */
export const parseSubgraphEvent = ({
  name,
  args,
  transaction,
  id,
  address,
  timestamp,
}: NormalizedSubgraphEvent): ExtendedLogDescription => {
  const blockNumber =
    transaction?.block?.number &&
    parseInt(transaction.block.number.replace('block_', ''), 10);
  const parsedArguments = JSON.parse(args);
  let parsedEvent: ExtendedLogDescription = {
    name: name.substring(0, name.indexOf('(')) as ColonyAndExtensionsEvents,
    signature: name,
    topic: topicId(name),
    address,
    ...(blockNumber && { blockNumber }),
    ...(timestamp && { timestamp: parseInt(timestamp, 10) * 1000 }),
    /*
     * Parse the normal values, and any specialized parsers we might have
     */
    values: {
      ...parsedArguments,
      ...roleArgumentParser(parsedArguments),
      ...extensionArgumentParser(parsedArguments),
      ...addressArgumentParser(parsedArguments),
      ...motionArgumentparser(parsedArguments),
      ...storageSlotArgumentParser(parsedArguments),
      ...whitelistEventsArgumentParser(parsedArguments),
    },
  };
  /*
   * If we fetched the id in the subgraph query, then we can also construct
   * a unique event id (blockNumber + logIndex) which can be used to sort
   * the events historically.
   *
   * This is needed since multiple events can be emmited inside a since block,
   * meaning we can't just go by block number or timestamp alone
   */
  if (blockNumber && id) {
    /*
     * `lastIndexOf` gets the start of the occurance, and 6 is the length of
     * the keyword occurence
     *
     * Padding with 7 zeros is a bit overkill, but we ensure that can support
     * up to a million events happen inside a block
     */
    const logIndex = id.slice(id.lastIndexOf('event_') + 6).padStart(7, '0');
    parsedEvent.index = `${blockNumber}${logIndex}`;
  }
  /*
   * If we also fetched transaction values, parse them as well
   * Note that we attempt to parse the block number earlier in this function
   */
  if (transaction) {
    const { transactionHash } = transaction;
    parsedEvent = {
      ...parsedEvent,
      ...(transactionHash && { hash: transactionHash }),
    };
  }
  return parsedEvent;
};
