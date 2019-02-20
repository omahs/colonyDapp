/* @flow */

import type { UserProfileType } from '~immutable';

import type {
  ActionType,
  ActionTypeWithPayload,
  ErrorActionType,
  UniqueActionType,
} from '../index';

import { ACTIONS } from '../../index';

export type CurrentUserActionTypes = {|
  CURRENT_USER_CREATE: UniqueActionType<
    typeof ACTIONS.CURRENT_USER_CREATE,
    {|
      balance: string,
      profileData: $Shape<UserProfileType>,
      walletAddress: string,
    |},
    void,
  >,
  CURRENT_USER_CREATE_ERROR: ErrorActionType<
    typeof ACTIONS.CURRENT_USER_CREATE_ERROR,
    void,
  >,
  CURRENT_USER_CREATE_SUCCESS: UniqueActionType<
    typeof ACTIONS.CURRENT_USER_CREATE_SUCCESS,
    void,
    void,
  >,
  CURRENT_USER_GET_BALANCE: ActionType<typeof ACTIONS.CURRENT_USER_GET_BALANCE>,
  CURRENT_USER_GET_BALANCE_ERROR: ErrorActionType<
    typeof ACTIONS.CURRENT_USER_GET_BALANCE_ERROR,
    void,
  >,
  CURRENT_USER_GET_BALANCE_SUCCESS: ActionTypeWithPayload<
    typeof ACTIONS.CURRENT_USER_GET_BALANCE_SUCCESS,
    {|
      // Apparently a string, maybe converted from BN?
      balance: string,
    |},
  >,
|};
