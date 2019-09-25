import React, { useCallback, useMemo, useState } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import { compose } from 'recompose';
import { useMappedState } from 'redux-react-hook';

import { DialogType } from '~core/Dialog';
import Button from '~core/Button';
import withDialog from '~core/Dialog/withDialog';
import Heading from '~core/Heading';
import { Select } from '~core/Fields';
import { SpinnerLoader } from '~core/Preloaders';
import { DomainType, TokenType } from '~immutable/index';
import { Address } from '~types/index';
import { useDataFetcher, useRoles } from '~utils/hooks';
import { proxyOldRoles } from '~utils/data';

import { COLONY_TOTAL_BALANCE_DOMAIN_ID } from '../../../admin/constants';
import { domainsFetcher, tokenFetcher } from '../../../dashboard/fetchers';
import { useColonyNativeToken } from '../../../dashboard/hooks/useColonyNativeToken';
import { useColonyTokens } from '../../../dashboard/hooks/useColonyTokens';
import { walletAddressSelector } from '../../../users/selectors';
import {
  canEditTokens,
  canMoveTokens as canMoveTokensCheck,
} from '../../checks';

import FundingBanner from './FundingBanner';
import TokenList from './TokenList';

import styles from './Tokens.css';

const MSG = defineMessages({
  labelSelectDomain: {
    id: 'dashboard.Tokens.labelSelectDomain',
    defaultMessage: 'Select a domain',
  },
  navItemMoveTokens: {
    id: 'dashboard.Tokens.navItemMoveTokens',
    defaultMessage: 'Move funds',
  },
  navItemMintNewTokens: {
    id: 'dashboard.Tokens.navItemMintNewTokens',
    defaultMessage: 'Mint New tokens',
  },
  navItemEditTokens: {
    id: 'dashboard.Tokens.navItemEditTokens',
    defaultMessage: 'Edit tokens',
  },
  title: {
    id: 'dashboard.Tokens.title',
    defaultMessage: 'Tokens: {selectedDomainLabel}',
  },
});

interface Props {
  canMintNativeToken?: boolean;
  colonyAddress: Address;
  intl: IntlShape;
  openDialog: (dialogName: string, dialogProps?: object) => DialogType;
}

const Tokens = ({
  canMintNativeToken,
  colonyAddress,
  intl: { formatMessage },
  openDialog,
}: Props) => {
  // permissions checks
  const { data: roles } = useRoles(colonyAddress);
  const walletAddress = useMappedState(walletAddressSelector);
  const canEdit = useMemo(
    () => canEditTokens(proxyOldRoles(roles), walletAddress),
    [roles, walletAddress],
  );
  const canMoveTokens = useMemo(
    () => canMoveTokensCheck(roles, walletAddress),
    [roles, walletAddress],
  );

  // domains
  const [selectedDomain, setSelectedDomain] = useState<number>(1);
  const { data: domainsData, isFetching: isFetchingDomains } = useDataFetcher<
    DomainType[]
  >(domainsFetcher, [colonyAddress], [colonyAddress]);
  const domains = useMemo(
    () => [
      { value: COLONY_TOTAL_BALANCE_DOMAIN_ID, label: { id: 'domain.all' } },
      { value: 1, label: { id: 'domain.root' } },
      ...(domainsData || []).map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    ],
    [domainsData],
  );

  const selectedDomainLabel: string = useMemo(() => {
    const { label = '' } =
      domains.find(({ value }) => value === selectedDomain) || {};
    return typeof label === 'string' ? label : formatMessage(label);
  }, [domains, formatMessage, selectedDomain]);

  const setFieldValue = useCallback((_, value) => setSelectedDomain(value), [
    setSelectedDomain,
  ]);

  // get sorted tokens
  const [tokens] = useColonyTokens(colonyAddress);

  const nativeTokenReference = useColonyNativeToken(colonyAddress);
  const nativeTokenAddress = nativeTokenReference
    ? nativeTokenReference.address
    : '';
  const { data: nativeToken } = useDataFetcher<TokenType>(
    tokenFetcher,
    [nativeTokenAddress],
    [nativeTokenAddress],
  );

  // handle opening of dialogs
  const handleEditTokens = useCallback(
    () =>
      openDialog('ColonyTokenEditDialog', {
        selectedTokens: tokens && tokens.map(({ address }) => address),
        colonyAddress,
      }),
    [openDialog, tokens, colonyAddress],
  );
  const handleMintTokens = useCallback(
    () =>
      openDialog('TokenMintDialog', {
        nativeToken,
        colonyAddress,
      }),
    [openDialog, nativeToken, colonyAddress],
  );
  const handleMoveTokens = useCallback(
    () =>
      openDialog('TokensMoveDialog', {
        colonyAddress,
        toDomain: selectedDomain,
      }),
    [openDialog, colonyAddress, selectedDomain],
  );

  return (
    <div className={styles.main}>
      <main>
        <div className={styles.mainContent}>
          <div className={styles.titleContainer}>
            <Heading
              text={MSG.title}
              textValues={{ selectedDomainLabel }}
              appearance={{ size: 'medium', theme: 'dark' }}
            />
            {isFetchingDomains ? (
              <SpinnerLoader />
            ) : (
              <Select
                appearance={{ alignOptions: 'right', theme: 'alt' }}
                connect={false}
                elementOnly
                label={MSG.labelSelectDomain}
                name="selectDomain"
                options={domains}
                form={{ setFieldValue }}
                $value={selectedDomain}
              />
            )}
          </div>
          {tokens && (
            <TokenList
              domainId={selectedDomain}
              tokens={tokens}
              appearance={{ numCols: '3' }}
            />
          )}
        </div>
        <div>
          <FundingBanner colonyAddress={colonyAddress} />
        </div>
      </main>
      <aside className={styles.sidebar}>
        <ul>
          {canMoveTokens && (
            <li>
              <Button
                text={MSG.navItemMoveTokens}
                appearance={{ theme: 'blue' }}
                onClick={handleMoveTokens}
              />
            </li>
          )}
          {canMintNativeToken && (
            <li>
              <Button
                text={MSG.navItemMintNewTokens}
                appearance={{ theme: 'blue' }}
                onClick={handleMintTokens}
              />
            </li>
          )}
          {canEdit && (
            <li>
              <Button
                text={MSG.navItemEditTokens}
                appearance={{ theme: 'blue' }}
                onClick={handleEditTokens}
              />
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
};

Tokens.displayName = 'admin.Tokens';

const enhance = compose(
  withDialog(),
  injectIntl,
) as any;

export default enhance(Tokens);
