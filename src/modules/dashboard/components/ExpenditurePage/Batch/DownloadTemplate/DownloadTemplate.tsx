import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import ExternalLink from '~core/ExternalLink';

import { CSV } from './constants';
import styles from './DownloadTemplate.css';

export const MSG = defineMessages({
  downloadTemplate: {
    id: 'dashboard.ExpenditurePage.Batch.downloadTemplate',
    defaultMessage: 'Download template',
  },
});

const DownloadTemplate = () => {
  const fileDownloadUrl = useMemo(() => {
    const blob = new Blob([CSV], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  }, []);

  return (
    <ExternalLink
      href={fileDownloadUrl}
      download="expenditures_batch.csv"
      className={styles.link}
    >
      <FormattedMessage {...MSG.downloadTemplate} />
    </ExternalLink>
  );
};

DownloadTemplate.displayName =
  'dashboard.ExpenditurePage.Batch.DownloadTemplate';

export default DownloadTemplate;
