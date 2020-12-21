import React, { useState } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import { ColonyRole } from '@colony/colony-js';
import { nanoid } from 'nanoid';

import Numeral from '~core/Numeral';
import FriendlyUserName from '~core/FriendlyUserName';
import PermissionsLabel from '~core/PermissionsLabel';
import { TransactionMeta, TransactionStatus } from '~dashboard/ActionsPage';
import { AnyUser } from '~data/index';
import { ColonyAndExtensionsEvents } from '~types/index';

import { PaymentDetails } from '../ActionsPageFeed';
import { STATUS } from '../../ActionsPage/types';

import styles from './ActionsPageEvent.css';

const displayName = 'dashboard.ActionsPageFeed.ActionsPageEvent';

const MSG = defineMessages({
  rolesTooltip: {
    id: 'dashboard.ActionsPageFeed.ActionsPageEvent.rolesTooltip',
    defaultMessage: `{icon} {role, select,
      6 {This permission allows an account to manipulate payments (tasks) in
        their domain and to raise disputes.}
      other {This is a generic placeholder for a perssions type.
        You should not be sseing this}
    }`,
  },
});

interface Props {
  eventName?: string;
  eventValues?: Record<string, any>;
  transactionHash: string;
  createdAt: Date;
  initiator?: AnyUser;
  recipient?: AnyUser;
  payment?: PaymentDetails;
  emmitedBy?: string;
}

type RolesMap = Partial<
  {
    [key in ColonyAndExtensionsEvents]: ColonyRole[];
  }
>;

/*
 * @NOTE Event roles are stating, so we just need to create a manual map
 * Containing the actual event, and the role(s)
 */
const ROLES_MAP: RolesMap = {
  [ColonyAndExtensionsEvents.OneTxPaymentMade]: [ColonyRole.Administration],
  [ColonyAndExtensionsEvents.Generic]: [],
};

const ActionsPageEvent = ({
  createdAt,
  transactionHash,
  eventName = ColonyAndExtensionsEvents.Generic,
  initiator,
  recipient,
  payment,
  emmitedBy,
}: Props) => {
  /*
   * @NOTE See nanoId's docs about the reasoning for this
   * https://github.com/ai/nanoid#react
   *
   * We're creating a object with event names for keys, which, as values,
   * have an array of ids, for each available permission
   */
  const [autogeneratedIds] = useState<Record<string, string[]>>(() => {
    const eventsToIdsMap = {};
    Object.keys(ROLES_MAP).map((name) => {
      eventsToIdsMap[name] = [...new Array(ROLES_MAP[eventName])].map(nanoid);
      return null;
    });
    return eventsToIdsMap;
  });

  return (
    <div className={styles.main}>
      <div className={styles.status}>
        <TransactionStatus status={STATUS.Succeeded} showTooltip={false} />
      </div>
      <div className={styles.content}>
        <div className={styles.text}>
          <FormattedMessage
            id="event.title"
            values={{
              eventName,
              initiator: (
                <span className={styles.decoratedUser}>
                  <FriendlyUserName
                    user={initiator as AnyUser}
                    autoShrinkAddress
                  />
                </span>
              ),
              recipient: (
                <span className={styles.decoratedUser}>
                  <FriendlyUserName
                    user={recipient as AnyUser}
                    autoShrinkAddress
                  />
                </span>
              ),
              /*
               * @NOTE At some point with the help of events we'll be able to get
               * an actual payment name, rather than an id
               */
              paymentId: payment?.fromDomain || 1,
              amount: (
                <Numeral
                  value={payment?.amount || '0'}
                  /*
                   * @NOTE We don't need to call `getTokenDecimalsWithFallback` since
                   * we already did that when passing down the prop
                   */
                  unit={payment?.decimals}
                />
              ),
              tokenSymbol: <span>{payment?.symbol || '???'}</span>,
              eventNameDecorated: (
                <span className={styles.highlight}>{eventName}</span>
              ),
              clientOrExtensionType: (
                <span className={styles.highlight}>{emmitedBy}</span>
              ),
            }}
          />
        </div>
        <div className={styles.details}>
          <div className={styles.roles}>
            {eventName &&
              ROLES_MAP[eventName] &&
              ROLES_MAP[eventName].map((role, index) => (
                <PermissionsLabel
                  key={autogeneratedIds[eventName][index]}
                  appearance={{ theme: 'simple' }}
                  permission={role}
                  minimal
                  infoMessage={MSG.rolesTooltip}
                  infoMessageValues={{
                    role,
                    icon: (
                      <div className={styles.tooltipIcon}>
                        <PermissionsLabel
                          permission={role}
                          appearance={{ theme: 'white' }}
                        />
                      </div>
                    ),
                  }}
                />
              ))}
          </div>
          {transactionHash && (
            <div className={styles.meta}>
              <TransactionMeta
                transactionHash={transactionHash}
                createdAt={createdAt}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ActionsPageEvent.displayName = displayName;

export default ActionsPageEvent;