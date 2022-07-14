import React, { ComponentProps, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { Extension } from '@colony/colony-js';

import { useColonyExtensionsQuery, Colony } from '~data/index';
import { useExtensionAvailable } from '../../Extensions/utils';

import NavItem from './NavItem';

import styles from './ColonyNavigation.css';

const MSG = defineMessages({
  linkTextActions: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextActions',
    defaultMessage: 'Actions',
  },
  linkTextEvents: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextEvents',
    defaultMessage: 'Events',
  },
  linkTextExtensions: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextExtensions',
    defaultMessage: 'Extensions',
  },
  linkTextCoinMachine: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextCoinMachine',
    defaultMessage: 'Buy Tokens',
  },
  linkTextUnwrapTokens: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextUnwrapTokens',
    defaultMessage: 'Unwrap Tokens',
  },
  linkTextClaimTokens: {
    id: 'dashboard.ColonyHome.ColonyNavigation.linkTextClaimTokens',
    defaultMessage: 'Claim Tokens',
  },
  comingSoonMessage: {
    id: 'dashboard.ColonyNavigation.comingSoonMessage',
    defaultMessage: 'Coming Soon',
  },
});

type Props = {
  colony: Colony;
};

const displayName = 'dashboard.ColonyHome.ColonyNavigation';

const ColonyNavigation = ({ colony: { colonyAddress, colonyName } }: Props) => {
  const { data } = useColonyExtensionsQuery({
    variables: { address: colonyAddress },
  });
  /*
   * @TODO actually determine these
   * This can be easily inferred from the subgraph queries
   *
   * But for that we need to store the "current" count either in redux or
   * in local storage... or maybe a local resolver?
   *
   * Problem is I couldn't get @client resolvers to work with subgrap queries :(
   */
  const hasNewActions = false;
  const hasNewExtensions = false;

  const { availableExtensionFilter } = useExtensionAvailable();

  const items = useMemo<ComponentProps<typeof NavItem>[]>(() => {
    const navigationItems: ComponentProps<typeof NavItem>[] = [
      {
        linkTo: `/colony/${colonyName}`,
        showDot: hasNewActions,
        text: MSG.linkTextActions,
      },
      {
        exact: false,
        linkTo: `/colony/${colonyName}/extensions`,
        showDot: hasNewExtensions,
        text: MSG.linkTextExtensions,
        dataTest: 'extensionsNavigationButton',
      },
    ];
    if (data?.processedColony?.installedExtensions) {
      const { installedExtensions } = data.processedColony;
      const coinMachineExtension = installedExtensions
        /*
         * @NOTE Temporary disable coin machine and whitelist for anyone other than
         * the metacolony
         */
        .filter(({ extensionId }) => availableExtensionFilter(extensionId))
        .find(({ extensionId }) => extensionId === Extension.CoinMachine);
      /*
       * Only show the Buy Tokens navigation link if the Coin Machine extension is:
       * - installed
       * - enable
       * - not deprecated
       */
      if (
        coinMachineExtension &&
        coinMachineExtension?.details?.initialized &&
        !coinMachineExtension?.details?.deprecated
      ) {
        navigationItems.push({
          linkTo: `/colony/${colonyName}/buy-tokens`,
          showDot: false,
          text: MSG.linkTextCoinMachine,
        });
      }
    }

    return navigationItems;
  }, [
    colonyName,
    hasNewActions,
    hasNewExtensions,
    data,
    availableExtensionFilter,
  ]);

  return (
    <nav role="navigation" className={styles.main}>
      {items.map((itemProps) => (
        <NavItem key={itemProps.linkTo} {...itemProps} />
      ))}
    </nav>
  );
};

ColonyNavigation.displayName = displayName;

export default ColonyNavigation;
