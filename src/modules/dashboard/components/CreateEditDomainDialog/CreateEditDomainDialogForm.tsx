import React, { useState } from 'react';
import { ColonyRole } from '@colony/colony-js';
import { FormikProps } from 'formik';
import { FormattedMessage, defineMessages } from 'react-intl';

import Button from '~core/Button';
import ColorSelect from '~core/ColorSelect';
import { Color } from '~core/ColorTag';
import DialogSection from '~core/Dialog/DialogSection';
import { Input, Annotations } from '~core/Fields';
import Heading from '~core/Heading';
import PermissionsLabel from '~core/PermissionsLabel';
import PermissionRequiredInfo from '~core/PermissionRequiredInfo';

import { Colony, useLoggedInUser } from '~data/index';
import { useTransformer } from '~utils/hooks';

import { getAllUserRoles } from '../../../transformers';
import { canArchitect } from '../../../users/checks';

import { FormValues } from './CreateEditDomainDialog';
import styles from './CreateEditDomainDialogForm.css';

const MSG = defineMessages({
  titleCreate: {
    id:
      'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.titleCreate',
    defaultMessage: 'Create a new team',
  },
  titleEdit: {
    id: 'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.titleEdit',
    defaultMessage: 'Edit team details',
  },
  name: {
    id: 'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.name',
    defaultMessage: 'Team name',
  },
  purpose: {
    id: 'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.name',
    defaultMessage: 'What is the purpose of this team?',
  },
  annotation: {
    id:
      'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.annotation',
    defaultMessage: 'Explain why you’re creating this team',
  },
  noPermission: {
    id:
      // eslint-disable-next-line max-len
      'dashboard.CreateEditDomainDialog.CreateEditDomainDialogForm.noPermission',
    defaultMessage:
      // eslint-disable-next-line max-len
      'You need the {roleRequired} permission in {domain} to take this action.',
  },
});

interface Props {
  back?: () => void;
  colony: Colony;
  id?: string;
  isSubmitting;
  isValid;
}

const CreateEditDomainDialogForm = ({
  back,
  colony,
  handleSubmit,
  id,
  isSubmitting,
  isValid,
}: Props & FormikProps<FormValues>) => {
  const [domainColor, setDomainColor] = useState(Color.LightPink);

  const { walletAddress, username, ethereal } = useLoggedInUser();

  const allUserRoles = useTransformer(getAllUserRoles, [colony, walletAddress]);

  const hasRegisteredProfile = !!username && !ethereal;
  const canCreateEditDomain =
    hasRegisteredProfile && canArchitect(allUserRoles);

  return (
    <>
      <DialogSection appearance={{ theme: 'heading' }}>
        <Heading
          appearance={{ size: 'medium', margin: 'none' }}
          text={id === undefined ? MSG.titleCreate : MSG.titleEdit}
          className={styles.title}
        />
      </DialogSection>
      {!canCreateEditDomain && (
        <DialogSection>
          <PermissionRequiredInfo requiredRoles={[ColonyRole.Architecture]} />
        </DialogSection>
      )}
      <DialogSection>
        <div className={styles.nameAndColorContainer}>
          <div className={styles.domainName}>
            <Input
              label={MSG.name}
              name="teamName"
              appearance={{ colorSchema: 'grey', theme: 'fat' }}
              disabled={!canCreateEditDomain}
              maxLength={20}
            />
          </div>
          <ColorSelect
            activeOption={domainColor}
            appearance={{ alignOptions: 'right' }}
            onColorChange={setDomainColor}
            disabled={!canCreateEditDomain}
            name="domainColor"
          />
        </div>
      </DialogSection>
      <DialogSection>
        <Input
          label={MSG.purpose}
          name="domainPurpose"
          appearance={{ colorSchema: 'grey', theme: 'fat' }}
          disabled={!canCreateEditDomain}
          maxLength={90}
        />
      </DialogSection>
      <DialogSection>
        <Annotations
          label={MSG.annotation}
          name="annotationMessage"
          disabled={!canCreateEditDomain}
        />
      </DialogSection>
      {!canCreateEditDomain && (
        <DialogSection appearance={{ theme: 'sidePadding' }}>
          <div className={styles.noPermissionFromMessage}>
            <FormattedMessage
              {...MSG.noPermission}
              values={{
                roleRequired: (
                  <PermissionsLabel
                    permission={ColonyRole.Architecture}
                    name={{ id: `role.${ColonyRole.Architecture}` }}
                  />
                ),
                // placeholder for now, needs to be actual domain when `Edit` is done
                domain: id === undefined ? 'Root' : 'DOMAIN PLACEHOLDER',
              }}
            />
          </div>
        </DialogSection>
      )}
      <DialogSection appearance={{ align: 'right', theme: 'footer' }}>
        {back && (
          <Button
            text={{ id: 'button.back' }}
            onClick={back}
            appearance={{ theme: 'secondary', size: 'large' }}
          />
        )}
        <Button
          text={{ id: 'button.confirm' }}
          appearance={{ theme: 'primary', size: 'large' }}
          onClick={() => handleSubmit()}
          loading={isSubmitting}
          disabled={!canCreateEditDomain || !isValid}
        />
      </DialogSection>
    </>
  );
};

export default CreateEditDomainDialogForm;
