import React, { useMemo } from 'react';

import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './LogsSection.css';
import { logs, colony } from './consts';
import Log from './Log';
import { useLoggedInUser } from '~data/helpers';
import Comment, { CommentInput } from '~core/Comment';
import { Colony } from '~data/index';
import { Input } from '~core/Fields';
import { TransactionMeta } from '~dashboard/ActionsPage';

const MSG = defineMessages({
  commentPlaceholder: {
    id: 'dashboard.Expenditures.ExpenditureLogs.commentPlaceholder',
    defaultMessage: 'What would you like to say?',
  },
  emptyLog: {
    id: 'dashboard.Expenditures.ExpenditureLogs.emptyLog',
    defaultMessage: 'Log event',
  },
});

interface Props {
  colonyAddress: string;
  isFormEditable?: boolean;
}

const LogsSection = ({ colonyAddress, isFormEditable }: Props) => {
  const { username: currentUserName, ethereal } = useLoggedInUser();
  // add logs fetching here

  const renderLogs = useMemo(() => {
    return logs?.map((log) => {
      if (log.type === 'action' && log.actionType) {
        return <Log {...log} key={log.uniqueId} />;
      }
      const {
        createdAt,
        message,
        sourceId,
        deleted,
        adminDelete,
        userBanned,
        initiator,
      } = log;
      if (log.type === 'comment') {
        return (
          <div className={styles.comment}>
            <Comment
              key={log.uniqueId}
              createdAt={createdAt}
              comment={message}
              commentMeta={{
                id: sourceId || '',
                deleted,
                adminDelete,
                userBanned,
              }}
              colony={(colony as unknown) as Colony}
              user={initiator}
              showControls
            />
          </div>
        );
      }
      return null;
    });
  }, [logs]);

  return (
    <div className={styles.container}>
      {!logs ? (
        <div className={styles.logContainer}>
          <div className={styles.dotContainer}>
            <div className={styles.dot} />
          </div>
          <div>
            <FormattedMessage {...MSG.emptyLog} />
            <div className={styles.transactionMeta}>
              <TransactionMeta createdAt={new Date()} />
            </div>
          </div>
        </div>
      ) : (
        renderLogs
      )}
      {/*
       *  @NOTE A user can comment only if he has a wallet connected
       * and a registered user profile,
       * also input is disabled when the form is editable
       */}
      {currentUserName && !ethereal && (
        <>
          {isFormEditable ? (
            <div className={styles.disabledComment}>
              <Input
                name="disabled"
                placeholder={MSG.commentPlaceholder}
                elementOnly
                disabled
              />
            </div>
          ) : (
            <div className={styles.commentInput}>
              <CommentInput
                {...{
                  colonyAddress,
                  transactionHash:
                    // eslint-disable-next-line max-len
                    '0x1785d214f0127279681354be8e23ad1a1501207432229db93a415c7a58427138',
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogsSection;
