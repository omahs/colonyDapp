/* @flow */

import { Map as ImmutableMap, fromJS } from 'immutable';

import {
  COLONY_AVATAR_REMOVE_SUCCESS,
  COLONY_AVATAR_UPLOAD_SUCCESS,
  COLONY_FETCH,
  COLONY_FETCH_SUCCESS,
  COLONY_PROFILE_UPDATE_SUCCESS,
  COLONY_ADMIN_ADD_SUCCESS,
  COLONY_ADMIN_ADD_CONFIRM_SUCCESS,
  COLONY_ADMIN_REMOVE_SUCCESS,
  COLONY_ADMIN_REMOVE_CONFIRM_SUCCESS,
} from '../actionTypes';

import { ColonyRecord, DataRecord, TokenRecord } from '~immutable';
import { withDataReducer } from '~utils/reducers';

import type { AllColoniesMap, ColonyRecordType } from '~immutable';
import type { UniqueActionWithKeyPath } from '~types';

const coloniesReducer = (
  state: AllColoniesMap = ImmutableMap(),
  action: UniqueActionWithKeyPath,
) => {
  switch (action.type) {
    case COLONY_FETCH_SUCCESS: {
      const {
        payload: { token, ensName, admins, ...props },
      } = action;
      const record = ColonyRecord({
        token: TokenRecord(token),
        admins: ImmutableMap(admins),
        ensName,
        ...props,
      });
      return state.get(ensName)
        ? state.setIn([ensName, 'record'], record)
        : state.set(ensName, DataRecord<ColonyRecordType>({ record }));
    }
    case COLONY_PROFILE_UPDATE_SUCCESS: {
      const {
        meta: { keyPath },
        payload,
      } = action;
      // fromJS is `mixed`, so we have to cast `any`
      const props: any = fromJS(payload);
      return state.mergeDeepIn([...keyPath, 'record'], props);
    }
    case COLONY_AVATAR_UPLOAD_SUCCESS: {
      const {
        meta: { keyPath },
        payload: hash,
      } = action;
      return state.setIn([...keyPath, 'record', 'avatar'], hash);
    }
    case COLONY_AVATAR_REMOVE_SUCCESS: {
      const {
        meta: { keyPath },
      } = action;
      return state.setIn([...keyPath, 'record', 'avatar'], undefined);
    }
    case COLONY_ADMIN_ADD_SUCCESS: {
      const {
        meta: { keyPath },
        payload: { adminData },
      } = action;
      return state
        ? state.setIn(keyPath, {
            ...adminData.toObject(),
            state: 'pending',
          })
        : state;
    }
    case COLONY_ADMIN_ADD_CONFIRM_SUCCESS: {
      const {
        meta: { keyPath },
      } = action;
      return state ? state.setIn([...keyPath, 'state'], 'confirmed') : state;
    }
    case COLONY_ADMIN_REMOVE_SUCCESS: {
      const {
        meta: { keyPath },
      } = action;
      return state ? state.setIn([...keyPath, 'state'], 'pending') : state;
    }
    case COLONY_ADMIN_REMOVE_CONFIRM_SUCCESS: {
      const {
        meta: { keyPath },
      } = action;
      return state ? state.deleteIn(keyPath) : state;
    }
    default:
      return state;
  }
};

export default withDataReducer<AllColoniesMap, ColonyRecordType>(
  COLONY_FETCH,
  ImmutableMap(),
)(coloniesReducer);
