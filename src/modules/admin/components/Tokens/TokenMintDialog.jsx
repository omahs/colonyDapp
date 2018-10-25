/* @flow */

import type { FormikProps } from 'formik';

import React, { Component, Fragment } from 'react';
import { defineMessages } from 'react-intl';
import * as yup from 'yup';

import type { TokenType } from '~types/token';

import Button from '~core/Button';
import Dialog from '~core/Dialog';
import DialogSection from '~core/Dialog/DialogSection.jsx';
import { Form, Input } from '~core/Fields';
import Heading from '~core/Heading';

import styles from './TokenMintDialog.css';

const MSG = defineMessages({
  title: {
    id: 'admin.Tokens.TokenMintDialog.dialogTitle',
    defaultMessage: 'Mint new tokens',
  },
  descriptionText: {
    id: 'admin.Tokens.TokenMintDialog.descriptionText',
    defaultMessage: `The tokens you mint can be assigned to tasks.
      Only the Colony Owner can mint new tokens.`,
  },
  amountLabel: {
    id: 'admin.Tokens.TokenMintDialog.amountLabel',
    defaultMessage: 'Amount',
  },
  buttonCancel: {
    id: 'admin.Tokens.TokenMintDialog.buttonCancel',
    defaultMessage: 'Cancel',
  },
  buttonConfirm: {
    id: 'admin.Tokens.TokenMintDialog.buttonConfirm',
    defaultMessage: 'Confirm',
  },
  errorAmountMin: {
    id: 'admin.Tokens.TokenMintDialog.errorAmountMin',
    defaultMessage: 'Please enter an amount greater than 0.',
  },
  errorAmountNumeral: {
    id: 'admin.Tokens.TokenMintDialog.errorAmountNumeral',
    defaultMessage: 'Please enter a number.',
  },
  errorAmountRequired: {
    id: 'admin.Tokens.TokenMintDialog.errorAmountRequired',
    defaultMessage: 'Please enter an amount.',
  },
});

type FormValues = {
  mintAmount: number,
};

type Props = {
  cancel: () => void,
  close: () => void,
  nativeToken: TokenType,
  onMintNewTokensSubmitted: (tokenSymbol: string, amount: number) => void,
};

const validationSchema = yup.object().shape({
  mintAmount: yup
    .number(MSG.errorAmountNumeral)
    .required(MSG.errorAmountRequired)
    .min(0.000000000000000001, MSG.errorAmountMin),
});

class TokenMintDialog extends Component<Props> {
  timeoutId: TimeoutID;

  static displayName = 'admin.Tokens.TokenMintDialog';

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  handleSubmitTokenForm = ({ mintAmount }: FormValues) => {
    const {
      close,
      onMintNewTokensSubmitted,
      nativeToken: { tokenSymbol },
    } = this.props;
    // TODO handle form data here
    console.log(mintAmount);
    this.timeoutId = setTimeout(() => {
      close();
      onMintNewTokensSubmitted(tokenSymbol, mintAmount);
    }, 500);
  };

  render() {
    const {
      cancel,
      nativeToken: { tokenName, tokenSymbol },
    } = this.props;
    return (
      <Dialog cancel={cancel}>
        <Form
          initialValues={{
            mintAmount: 0,
          }}
          onSubmit={this.handleSubmitTokenForm}
          validationSchema={validationSchema}
        >
          {({
            handleSubmit,
            isSubmitting,
            isValid,
          }: FormikProps<FormValues>) => (
            <Fragment>
              <DialogSection>
                <Heading
                  appearance={{ size: 'medium', margin: 'none' }}
                  text={MSG.title}
                />
              </DialogSection>
              <DialogSection>
                <Heading
                  appearance={{
                    margin: 'double',
                    size: 'normal',
                    weight: 'thin',
                  }}
                  text={MSG.descriptionText}
                />
                <div className={styles.inputContainer}>
                  <div className={styles.input}>
                    <Input
                      appearance={{ theme: 'minimal' }}
                      formattingOptions={{
                        numeral: true,
                        numeralPositiveOnly: true,
                        numeralDecimalScale: 18,
                      }}
                      label={MSG.amountLabel}
                      name="mintAmount"
                    />
                  </div>
                  <span className={styles.nativeToken} title={tokenName}>
                    {tokenSymbol}
                  </span>
                </div>
              </DialogSection>
              <DialogSection appearance={{ align: 'right' }}>
                <Button
                  appearance={{ theme: 'secondary', size: 'large' }}
                  onClick={cancel}
                  text={MSG.buttonCancel}
                />
                <Button
                  appearance={{ theme: 'primary', size: 'large' }}
                  onClick={handleSubmit}
                  text={MSG.buttonConfirm}
                  loading={isSubmitting}
                  disabled={!isValid}
                />
              </DialogSection>
            </Fragment>
          )}
        </Form>
      </Dialog>
    );
  }
}

export default TokenMintDialog;
