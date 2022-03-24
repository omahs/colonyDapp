import React, { useCallback, useMemo, useState } from 'react';
import { FormikProps } from 'formik';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';

import Dialog, { DialogProps } from '~core/Dialog';
import { ActionForm } from '~core/Fields';

import {
  Colony,
  useVerifiedUsersQuery,
  useColonyFromNameQuery,
} from '~data/index';
import { ActionTypes } from '~redux/index';
import { WizardDialogType } from '~utils/hooks';
import {
  mergeSchemas,
  validationSchemaInput,
  validationSchemaFile,
} from '~utils/whitelistValidation';
import { pipe, withMeta, mapPayload } from '~utils/actions';
import { Address } from '~types/index';

import DialogForm from './ManageWhitelistDialogForm';

export enum TABS {
  ADD_ADDRESS = 0,
  WHITELISTED = 1,
}
export interface FormValues {
  annotation: string;
  isWhiletlistActivated: boolean;
  whitelistedAddresses: Address[];
}

interface CustomWizardDialogProps {
  prevStep: string;
  colony: Colony;
}

type Props = DialogProps & WizardDialogType<object> & CustomWizardDialogProps;

const displayName = 'dashboard.ManageWhitelistDialog';

const ManageWhitelistDialog = ({
  cancel,
  callStep,
  prevStep,
  colony,
  colony: { colonyAddress, avatarHash, colonyName },
}: Props) => {
  const [showInput, setShowInput] = useState<boolean>(true);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(TABS.ADD_ADDRESS);

  const handleToggleShowInput = useCallback(() => {
    setShowInput((state) => !state);
    // clear success msgs when switching inputs
    setFormSuccess(false);
  }, [setShowInput, setFormSuccess]);

  const history = useHistory();

  /* We don't close the dialog after submitting data
  => need a way for a refreshed colony to be reflected */
  const { data: colonyData } = useColonyFromNameQuery({
    variables: { name: colonyName, address: colonyAddress },
  });

  const { data } = useVerifiedUsersQuery({
    variables: {
      verifiedAddresses:
        colonyData?.processedColony?.whitelistedAddresses || [],
    },
    fetchPolicy: 'network-only',
  });

  const addressesList = useMemo(
    () =>
      (data?.verifiedUsers || []).map((user) => user?.profile.walletAddress),
    [data],
  );

  const validationSchema = yup.object().shape({
    annotation: yup.string().max(4000),
  });

  const addressesValidationSchema = useMemo(() => {
    if (tabIndex === TABS.WHITELISTED) {
      return yup.object({
        whitelistedAddresses: yup.array().ensure().of(yup.string().address()),
      });
    }
    return showInput ? validationSchemaInput : validationSchemaFile;
  }, [tabIndex, showInput]);

  const mergedSchemas = mergeSchemas(
    validationSchema,
    addressesValidationSchema,
  );

  const handleTabChange = (index) => {
    setFormSuccess(false);
    setTabIndex(index);
  };

  const transform = useCallback(
    pipe(
      mapPayload(
        ({
          annotation: annotationMessage,
          whitelistAddress,
          whitelistedAddresses,
          whitelistCSVUploader,
        }) => {
          let verifiedAddresses;
          if (tabIndex === TABS.WHITELISTED) {
            verifiedAddresses = whitelistedAddresses;
          } else {
            verifiedAddresses =
              whitelistAddress !== undefined
                ? [...new Set([...addressesList, whitelistAddress])]
                : whitelistCSVUploader[0]?.parsedData;
          }

          return {
            colonyAddress,
            colonyDisplayName: colony.displayName,
            colonyAvatarHash: avatarHash,
            verifiedAddresses,
            annotationMessage,
            colonyName,
          };
        },
      ),
      withMeta({ history }),
    ),
    [tabIndex],
  );

  return (
    <ActionForm
      validateOnChange
      initialValues={{
        annotation: undefined,
        isWhiletlistActivated: true,
        whitelistedAddresses: addressesList,
        // data?.verifiedUsers.map(
        //   (user) => user?.profile.walletAddress,
        // ),
        isSubmitting: false,
      }}
      submit={ActionTypes.COLONY_VERIFIED_RECIPIENTS_MANAGE}
      error={ActionTypes.COLONY_VERIFIED_RECIPIENTS_MANAGE_ERROR}
      success={ActionTypes.COLONY_VERIFIED_RECIPIENTS_MANAGE_SUCCESS}
      validationSchema={mergedSchemas}
      transform={transform}
      enableReinitialize
      onSuccess={() => {
        if (tabIndex === TABS.ADD_ADDRESS) {
          setFormSuccess(true);
        }
      }}
    >
      {(formValues: FormikProps<FormValues>) => (
        <Dialog cancel={cancel} noOverflow={false}>
          <DialogForm
            {...formValues}
            colony={colony}
            whitelistedUsers={data?.verifiedUsers || []}
            back={() => callStep(prevStep)}
            showInput={showInput}
            toggleShowInput={handleToggleShowInput}
            formSuccess={formSuccess}
            setFormSuccess={(isSuccess) => setFormSuccess(isSuccess)}
            tabIndex={tabIndex}
            setTabIndex={handleTabChange}
          />
        </Dialog>
      )}
    </ActionForm>
  );
};

ManageWhitelistDialog.displayName = displayName;

export default ManageWhitelistDialog;
