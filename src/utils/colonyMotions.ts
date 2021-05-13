import { defineMessage } from 'react-intl';
import { BigNumber, bigNumberify } from 'ethers/utils';
import { Decimal } from 'decimal.js';

export enum MotionState {
  Motion = 'Motion',
  StakeRequired = 'StakeRequired',
  Voting = 'Voting',
  Reveal = 'Reveal',
  Objection = 'Objection',
  Failed = 'Failed',
  Passed = 'Passed',
  FailedNoFinalizable = 'FailedNoFinalizable',
  Invalid = 'Invalid',
  Escalation = 'Escalation',
}

export enum MotionVote {
  Yay = 1,
  Nay = 0,
}

const MSG = defineMessage({
  motionTag: {
    id: 'dashboard.ActionsPage.motionTag',
    defaultMessage: 'Motion',
  },
  stakeRequiredTag: {
    id: 'dashboard.ActionsPage.stakeRequiredTag',
    defaultMessage: 'Stake required',
  },
  votingTag: {
    id: 'dashboard.ActionsPage.votingTag',
    defaultMessage: 'Voting',
  },
  revealTag: {
    id: 'dashboard.ActionsPage.revealTag',
    defaultMessage: 'Reveal',
  },
  objectionTag: {
    id: 'dashboard.ActionsPage.objectionTag',
    defaultMessage: 'Objection',
  },
  failedTag: {
    id: 'dashboard.ActionsPage.failedTag',
    defaultMessage: 'Failed',
  },
  passedTag: {
    id: 'dashboard.ActionsPage.passedTag',
    defaultMessage: 'Passed',
  },
  invalidTag: {
    id: 'dashboard.ActionsPage.invalidTag',
    defaultMessage: 'Invalid',
  },
});

export const MOTION_TAG_MAP = {
  [MotionState.Motion]: {
    theme: 'primary',
    colorSchema: 'fullColor',
    name: MSG.motionTag,
    tagName: 'motionTag',
  },
  [MotionState.StakeRequired]: {
    theme: 'pink',
    colorSchema: 'fullColor',
    name: MSG.stakeRequiredTag,
    tagName: 'stakeRequiredTag',
  },
  [MotionState.Voting]: {
    theme: 'golden',
    colorSchema: 'fullColor',
    name: MSG.votingTag,
    tagName: 'votingTag',
  },
  [MotionState.Reveal]: {
    theme: 'blue',
    colorSchema: 'fullColor',
    name: MSG.revealTag,
    tagName: 'revealTag',
  },
  [MotionState.Objection]: {
    theme: 'pink',
    colorSchema: 'fullColor',
    name: MSG.objectionTag,
    tagName: 'objectionTag',
  },
  [MotionState.Failed]: {
    theme: 'pink',
    colorSchema: 'plain',
    name: MSG.failedTag,
    tagName: 'failedTag',
  },
  [MotionState.FailedNoFinalizable]: {
    theme: 'pink',
    colorSchema: 'plain',
    name: MSG.failedTag,
    tagName: 'failedTag',
  },
  [MotionState.Passed]: {
    theme: 'primary',
    colorSchema: 'plain',
    name: MSG.passedTag,
    tagName: 'passedTag',
  },
  [MotionState.Invalid]: {
    theme: 'pink',
    colorSchema: 'plain',
    name: MSG.invalidTag,
    tagName: 'invalidTag',
  },
};

export const getMotionRequiredStake = (
  skillRep: BigNumber,
  totalStakeFraction: BigNumber,
  decimals: number,
): BigNumber => {
  const requiredStake = skillRep
    .mul(totalStakeFraction)
    .div(bigNumberify(10).pow(decimals));

  return requiredStake;
};

const ONE_SECOND = 1000;
export const getEarlierEventTimestamp = (
  currentTimestamp: number,
  subTime = ONE_SECOND,
) => {
  return currentTimestamp - subTime;
};

export const shouldDisplayMotion = (
  currentStake: string,
  requiredStake: string,
): boolean => {
  if (requiredStake === '0') return true;
  return new Decimal(currentStake)
    .div(new Decimal(requiredStake))
    .times(100)
    .gte(10);
};

export interface MotionValue {
  motionId: number;
}

export const stakeValidationMSG = defineMessage({
  hasInactiveTokens: {
    id: 'dashboard.ActionsPage.hasInactiveTokens',
    defaultMessage: `You have inactive tokens which cannot be staked, please activate them. <a>Learn more</a>`,
  },
  notEnoughTokens: {
    id: 'dashboard.ActionsPage.notEnoughTokens',
    defaultMessage:
      'You do not have enough activated tokens to stake. <a>Learn more</a>',
  },
});

// @TODO: Add actual links for help
export const INACTIVE_TOKEN_HELP_LINK = '/';
export const NOT_ENOUGH_TOKENS_HELP_LINK = '/';
