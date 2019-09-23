import React, { useCallback } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { OpenDialog } from '~core/Dialog/types';
import { TaskType, UserType } from '~immutable/index';

import { ActionTypes } from '~redux/index';
import { mergePayload } from '~utils/actions';

import withDialog from '~core/Dialog/withDialog';
import Button, { ActionButton } from '~core/Button';
import unfinishedProfileOpener from '~users/UnfinishedProfile';

import { canRequestToWork, hasRequestedToWork } from '../../checks';
import { userDidClaimProfile } from '../../../users/checks';

import styles from './TaskRequestWork.css';

const MSG = defineMessages({
  requestWork: {
    id: 'dashboard.TaskRequestWork.requestWork',
    defaultMessage: 'Request to work',
  },
  workRequestSubmitted: {
    id: 'dashboard.TaskRequestWork.workRequestSubmitted',
    defaultMessage: 'Work request submitted',
  },
});

const displayName = 'dashboard.TaskRequestWork';

// Can't seal this object because of withConsumerFactory
interface Props {
  openDialog: OpenDialog;
  currentUser: UserType;
  task: TaskType;
  history: any;
}

const TaskRequestWork = ({
  currentUser: {
    profile: { walletAddress },
  },
  currentUser,
  task: { colonyAddress, draftId },
  task,
  history,
}: Props) => {
  const transform = useCallback(mergePayload({ colonyAddress, draftId }), [
    colonyAddress,
    draftId,
  ]);

  if (hasRequestedToWork(task, walletAddress)) {
    return (
      <p className={styles.requestSubmittedText}>
        <FormattedMessage {...MSG.workRequestSubmitted} />
      </p>
    );
  }

  if (
    userDidClaimProfile(currentUser) &&
    canRequestToWork(task, walletAddress)
  ) {
    return (
      <ActionButton
        text={MSG.requestWork}
        submit={ActionTypes.TASK_SEND_WORK_REQUEST}
        error={ActionTypes.TASK_SEND_WORK_REQUEST_ERROR}
        success={ActionTypes.TASK_SEND_WORK_REQUEST_SUCCESS}
        transform={transform}
      />
    );
  }

  return (
    <Button
      text={MSG.requestWork}
      onClick={() => unfinishedProfileOpener(history)}
      data-test="requestWorkButton"
    />
  );
};

TaskRequestWork.displayName = displayName;

export default withDialog()(TaskRequestWork) as any;