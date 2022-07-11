import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Link from '~core/Link';

import Tag from '~core/Tag';
import styles from './LinkedMotions.css';

const MSG = defineMessages({
  linkedMotions: {
    id: 'dashboard.Expenditures.Stages.linkedMotions',
    defaultMessage: 'Linked motions',
  },
  foundExp: {
    id: 'dashboard.Expenditures.Stages.foundExp',
    defaultMessage: 'Fund Exp',
  },
  passed: {
    id: 'dashboard.Expenditures.Stages.passed',
    defaultMessage: 'Passed',
  },
  failed: {
    id: 'dashboard.Expenditures.Stages.failed',
    defaultMessage: 'Failed',
  },
  motion: {
    id: 'dashboard.Expenditures.Stages.motion',
    defaultMessage: 'Motion',
  },
});

const displayName = 'dashboard.ExpenditurePage.Stages.LinkedMotions';

interface Props {
  status: 'passed' | 'failed' | 'pending';
  motionLink?: string;
}

const LinkedMotions = ({ status, motionLink }: Props) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <div className={styles.line} />
        <div className={styles.dot} />
        <div className={styles.line} />
        <div className={styles.title}>
          <FormattedMessage {...MSG.linkedMotions} />
        </div>
      </div>
      <div className={styles.statusWrapper}>
        <FormattedMessage {...MSG.foundExp} /> - 25
        {status === 'pending' && motionLink ? (
          <Link to={motionLink} className={styles.link}>
            <FormattedMessage {...MSG.motion} />
          </Link>
        ) : (
          <Tag
            text={status === 'passed' ? MSG.passed : MSG.failed}
            data-test="deprecatedStatusTag"
            style={{
              color:
                status === 'passed' ? styles.passedColor : styles.failedColor,
            }}
            appearance={{ theme: 'light' }}
          />
        )}
      </div>
    </div>
  );
};

LinkedMotions.displayName = displayName;

export default LinkedMotions;
