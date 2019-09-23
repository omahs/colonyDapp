import React, { useCallback, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import BigNumber from 'bn.js';

import { Address, createAddress } from '~types/index';

import Button from '~core/Button';
import EthUsd from '~core/EthUsd';
import Heading from '~core/Heading';
import Input from '~core/Fields/Input';
import Select from '~core/Fields/Select';
import Numeral from '~core/Numeral';

import NetworkFee from '../NetworkFee';
import { useColonyTokens } from '../../../hooks/useColonyTokens';
import { tokenIsETH } from '../../../../core/checks';

import styles from './Payout.css';

const MSG = defineMessages({
  notSet: {
    id: 'dashboard.TaskEditDialog.Payout.notSet',
    defaultMessage: 'Not set',
  },
  reputation: {
    id: 'dashboard.TaskEditDialog.Payout.reputation',
    defaultMessage: '{reputation} max rep',
  },
});

interface Props {
  amount?: number | BigNumber;
  canRemove?: boolean;
  colonyAddress: Address;
  editPayout?: boolean;
  name: string;
  remove?: () => void;
  reputation?: number;
  reset?: () => void;
  tokenAddress: Address;
  tokenOptions?: { value: number; label: string }[];
}

const displayName = 'dashboard.TaskEditDialog.Payout';

const Payout = ({
  amount,
  canRemove = true,
  colonyAddress,
  editPayout = true,
  name,
  remove,
  reputation,
  reset,
  tokenAddress,
  tokenOptions,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const exitEditAndCancel = useCallback(() => {
    if (isEditing && reset) {
      reset();
    }
    setIsEditing(false);
  }, [isEditing, reset]);

  const [, availableTokens] = useColonyTokens(colonyAddress);

  const token = (availableTokens &&
    availableTokens.find(({ address }) => address === tokenAddress)) || {
    address: createAddress(''),
    decimals: 18,
    name: '',
    symbol: '',
  }; // make flow happy for below

  const isEth = useMemo(() => tokenIsETH(token), [token]);

  const { decimals = 18, symbol } = token;

  return (
    <div>
      <div hidden={!isEditing}>
        <div className={styles.row}>
          <Heading
            appearance={{ size: 'small', margin: 'small' }}
            text={{ id: 'label.amount' }}
          />
          <span>
            {canRemove && (
              <Button
                appearance={{ theme: 'blue', size: 'small' }}
                text={{ id: 'button.remove' }}
                onClick={remove}
              />
            )}
            <Button
              appearance={{ theme: 'blue', size: 'small' }}
              text={{ id: 'button.cancel' }}
              onClick={exitEditAndCancel}
            />
          </span>
        </div>
        <div className={styles.editContainer}>
          <div className={styles.setAmount}>
            <Input
              appearance={{ theme: 'minimal', align: 'right' }}
              name={`${name}.amount`}
              formattingOptions={{
                delimiter: ',',
                numeral: true,
                numeralDecimalScale: decimals,
              }}
            />
          </div>
          <div className={styles.selectToken}>
            <Select options={tokenOptions} name={`${name}.token`} />
          </div>
        </div>
      </div>
      <div hidden={isEditing}>
        <div className={styles.row}>
          <Heading
            appearance={{ size: 'small' }}
            text={{ id: 'label.amount' }}
          />
          {amount ? (
            <div className={styles.fundingDetails}>
              <div>
                <span className={styles.amount}>
                  <Numeral
                    appearance={{
                      size: 'medium',
                      theme: 'grey',
                    }}
                    value={amount}
                  />
                </span>
                <span>{symbol}</span>
              </div>
              {reputation && (
                <div className={styles.reputation}>
                  <FormattedMessage
                    {...MSG.reputation}
                    values={{ reputation }}
                  />
                </div>
              )}
              {isEth && !isEditing && (
                <div className={styles.conversion}>
                  <EthUsd
                    appearance={{ theme: 'grey', size: 'small' }}
                    value={amount}
                  />
                </div>
              )}
            </div>
          ) : (
            <FormattedMessage {...MSG.notSet} />
          )}
          <div>
            {editPayout && (
              <Button
                appearance={{ theme: 'blue', size: 'small' }}
                text={{ id: 'button.modify' }}
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        </div>
        {amount && symbol && !isEditing && (
          <div className={styles.networkFeeRow}>
            <NetworkFee amount={amount} decimals={decimals} symbol={symbol} />
          </div>
        )}
      </div>
    </div>
  );
};

Payout.displayName = displayName;

export default Payout;