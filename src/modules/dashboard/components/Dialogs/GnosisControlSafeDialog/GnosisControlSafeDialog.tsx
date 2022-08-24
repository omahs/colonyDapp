import React, { useCallback, useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import * as yup from 'yup';
import toFinite from 'lodash/toFinite';
import { defineMessages } from 'react-intl';

import { AnyUser } from '~data/index';
import Dialog, { DialogProps, ActionDialogProps } from '~core/Dialog';
import { ActionForm } from '~core/Fields';

import { ActionTypes } from '~redux/index';
import { WizardDialogType } from '~utils/hooks';
import { Address } from '~types/index';

import { TransactionTypes } from './constants';
import GnosisControlSafeForm, { NFT } from './GnosisControlSafeForm';
import { AbiItemExtended } from '~modules/dashboard/hooks/useContractABIParser';

const MSG = defineMessages({
  requiredFieldError: {
    id: 'dashboard.GnosisControlSafeDialog.requiredFieldError',
    defaultMessage: 'Please enter a value',
  },
  amountZero: {
    id: 'dashboard.GnosisControlSafeDialog.amountZero',
    defaultMessage: 'Amount must be greater than zero',
  },
  notAddressArray: {
    id: 'dashboard.GnosisControlSafeDialog.notAddressArray',
    defaultMessage: 'Addresses must be formatted correctly',
  },
});

/* to remove when data is wired in */
const safes = [
  {
    name: 'All Saints',
    address: '0x3a157280ca91bB49dAe3D1619C55Da7F9D4438c2',
    chain: 'Gnosis Chain',
  },
  {
    name: '',
    address: '0x3a157280ca91bB49dAe3D1619C55Da7F9D4438c3',
    chain: 'Mainnet',
  },
];

export interface FormValues {
  transactions: {
    transactionType: string;
    tokenAddress?: Address;
    amount?: number;
    recipient?: AnyUser;
    data?: string;
    contract?: AnyUser;
    abi?: string;
    contractFunction?: string;
    nft: NFT;
  }[];
  safe: string;
  forceAction: boolean;
  transactionsTitle: string;
}

const displayName = 'dashboard.GnosisControlSafeDialog';

type Props = DialogProps &
  Partial<WizardDialogType<object>> &
  ActionDialogProps;

const GnosisControlSafeDialog = ({
  colony,
  cancel,
  callStep,
  prevStep,
  isVotingExtensionEnabled,
}: Props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedContractMethod, setSelectedContractMethod] = useState<
    AbiItemExtended
  >();
  const [expandedValidationSchema, setExpandedValidationSchema] = useState<
    Record<string, any>
  >({});

  const getMethodInputValidation = useCallback(
    (inputType: string, contractName: string, isArraySchema?: boolean) => {
      if (inputType.slice(-2) === '[]') {
        return yup.array().when('contractFunction', {
          is: (contractFunction) => contractFunction === contractName,
          then: yup
            .array()
            .ensure()
            .of(
              getMethodInputValidation(
                inputType.slice(0, -2),
                contractName,
                true,
              ),
            ),
          otherwise: false,
        });
      }
      if (inputType === 'uint256') {
        return yup.number().when('contractFunction', {
          is: (contractFunction) =>
            contractFunction === contractName || isArraySchema,
          then: yup
            .number()
            .transform((value) => toFinite(value))
            .required(() => MSG.requiredFieldError),
          otherwise: false,
        });
      }
      if (inputType === 'address') {
        return yup.string().when('contractFunction', {
          is: (contractFunction) => {
            return contractFunction === contractName || isArraySchema;
          },
          then: yup
            .string()
            .address(() => (isArraySchema ? MSG.notAddressArray : null))
            .required(() => MSG.requiredFieldError),
          otherwise: false,
        });
      }
      if (inputType === 'bool') {
        return yup.bool().when('contractFunction', {
          is: (contractFunction) =>
            contractFunction === contractName || isArraySchema,
          then: yup.bool().required(() => MSG.requiredFieldError),
          otherwise: false,
        });
      }
      return yup.string().when('contractFunction', {
        is: (contractFunction) =>
          contractFunction === contractName || isArraySchema,
        then: yup.string().required(() => MSG.requiredFieldError),
        otherwise: false,
      });
    },
    [],
  );

  useEffect(() => {
    if (selectedContractMethod) {
      const updatedExpandedValidationSchema = {};

      selectedContractMethod?.inputs?.map((input) => {
        updatedExpandedValidationSchema[input.name] = getMethodInputValidation(
          input.type,
          selectedContractMethod.name,
        );
      });

      setExpandedValidationSchema(updatedExpandedValidationSchema);
    }
  }, [selectedContractMethod, getMethodInputValidation]);

  const validationSchema = yup.object().shape({
    safe: yup.string().required(() => MSG.requiredFieldError),
    ...(showPreview ? { transactionsTitle: yup.string().required() } : {}),
    transactions: yup.array(
      yup.object().shape({
        transactionType: yup.string().required(() => MSG.requiredFieldError),
        recipient: yup.object().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.TRANSFER_FUNDS,
          then: yup.object().shape({
            profile: yup.object().shape({
              walletAddress: yup
                .string()
                .address()
                .required(() => MSG.requiredFieldError),
            }),
          }),
          otherwise: false,
        }),
        amount: yup.number().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.TRANSFER_FUNDS ||
            transactionType === TransactionTypes.RAW_TRANSACTION,
          then: yup
            .number()
            .transform((value) => toFinite(value))
            .required(() => MSG.requiredFieldError)
            .moreThan(0, () => MSG.amountZero),
          otherwise: false,
        }),
        tokenAddress: yup.string().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.TRANSFER_FUNDS,
          then: yup
            .string()
            .address()
            .required(() => MSG.requiredFieldError),
          otherwise: false,
        }),
        data: yup.string().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.RAW_TRANSACTION,
          then: yup.string().required(() => MSG.requiredFieldError),
          otherwise: false,
        }),
        contract: yup.object().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.CONTRACT_INTERACTION,
          then: yup.object().shape({
            profile: yup.object().shape({
              walletAddress: yup
                .string()
                .address()
                .required(() => MSG.requiredFieldError),
            }),
          }),
          otherwise: false,
        }),
        abi: yup.string().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.CONTRACT_INTERACTION,
          then: yup.string().required(() => MSG.requiredFieldError),
          otherwise: false,
        }),
        contractFunction: yup.string().when('transactionType', {
          is: (transactionType) =>
            transactionType === TransactionTypes.CONTRACT_INTERACTION,
          then: yup.string().required(() => MSG.requiredFieldError),
          otherwise: false,
        }),
        nft: yup
          .object()
          .shape({
            profile: yup.object().shape({
              displayName: yup.string().when('transactionType', {
                is: (transactionType) =>
                  transactionType === TransactionTypes.TRANSFER_NFT,
                then: yup.string().required(() => MSG.requiredFieldError),
                otherwise: false,
              }),
              walletAddress: yup.string().when('transactionType', {
                is: (transactionType) =>
                  transactionType === TransactionTypes.TRANSFER_NFT,
                then: yup
                  .string()
                  .address()
                  .required(() => MSG.requiredFieldError),
                otherwise: false,
              }),
            }),
          })
          .nullable(),
        ...expandedValidationSchema,
      }),
    ),
  });

  return (
    <ActionForm
      initialValues={{
        safe: '',
        transactionsTitle: undefined,
        transactions: [
          {
            transactionType: '',
            tokenAddress: colony.nativeTokenAddress,
            amount: undefined,
            recipient: undefined,
            data: '',
            contract: undefined,
            abi: '',
            contractFunction: '',
            nft: null,
          },
        ],
      }}
      validationSchema={validationSchema}
      submit={ActionTypes.ACTION_GENERIC}
      success={ActionTypes.ACTION_GENERIC_SUCCESS}
      error={ActionTypes.ACTION_GENERIC_ERROR}
      validateOnMount
    >
      {(formValues: FormikProps<FormValues>) => (
        <Dialog cancel={cancel}>
          <GnosisControlSafeForm
            {...formValues}
            back={callStep && prevStep ? () => callStep(prevStep) : undefined}
            colony={colony}
            safes={safes}
            isVotingExtensionEnabled={isVotingExtensionEnabled}
            showPreview={showPreview}
            handleShowPreview={setShowPreview}
            selectedContractMethod={selectedContractMethod}
            handleSelectedContractMethod={setSelectedContractMethod}
          />
        </Dialog>
      )}
    </ActionForm>
  );
};

GnosisControlSafeDialog.displayName = displayName;

export default GnosisControlSafeDialog;
