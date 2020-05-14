import { call, put } from 'redux-saga/effects';
import { bigNumberify } from 'ethers/utils';

import { AllActions, ActionTypes } from '~redux/index';
import { ContextModule, TEMP_getContext } from '~context/index';
import { putError } from '~utils/saga/effects';

function* networkFetch() {
  try {
    const colonyManager = TEMP_getContext(ContextModule.ColonyManager);
    const feeInverse = yield colonyManager.networkClient.getFeeInverse();
    // FIXME fee value
    // Fee will always be a zero string
    const fee = bigNumberify(1).div(feeInverse).toString();
    const version = yield colonyManager.networkClient.getCurrentColonyVersion();

    yield put<AllActions>({
      type: ActionTypes.NETWORK_FETCH_SUCCESS,
      payload: {
        fee,
        feeInverse: feeInverse.toString(),
        version: version.toString(),
      },
    });
  } catch (error) {
    return yield putError(ActionTypes.NETWORK_FETCH_ERROR, error);
  }
  return null;
}

export default function* networkSagas() {
  yield call(networkFetch);
}
