import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import Button from '~core/Button';
import styles from './EditButton.css';

const MSG = defineMessages({
  cancel: {
    id: 'dashboard.Expenditures.ExpenditurePage.EditButtons.cancel',
    defaultMessage: 'Cancel',
  },
  update: {
    id: 'dashboard.Expenditures.ExpenditurePage.EditButtons.update',
    defaultMessage: 'Update',
  },
});

interface Props {
  handleEditSubmit: () => void;
  handleEditCancel: () => void;
}

const EditButtons = ({ handleEditCancel, handleEditSubmit }: Props) => {
  return (
    <div className={styles.wrapper}>
      <Button appearance={{ theme: 'secondary' }} onClick={handleEditCancel}>
        <FormattedMessage {...MSG.cancel} />
      </Button>
      <Button onClick={handleEditSubmit}>
        <FormattedMessage {...MSG.update} />
      </Button>
    </div>
  );
};

export default EditButtons;
