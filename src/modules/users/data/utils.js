/* @flow */

import type { UserMetadataStore } from '~data/types';
import { USER_EVENT_TYPES } from '~data/constants';
import { getUserTokensReducer } from './reducers';
import {
  NOTIFICATION_EVENT_ADMIN_ADDED,
  NOTIFICATION_EVENT_ADMIN_REMOVED,
  NOTIFICATION_EVENT_COLONY_ENS_CREATED,
  NOTIFICATION_EVENT_DOMAIN_ADDED,
  NOTIFICATION_EVENT_TOKENS_MINTED,
  NOTIFICATION_EVENT_USER_TRANSFER,
} from '~users/Inbox/events';

const { TOKEN_ADDED, TOKEN_REMOVED } = USER_EVENT_TYPES;

export const getUserTokenAddresses = (metadataStore: UserMetadataStore) =>
  metadataStore
    .all()
    .filter(({ type }) => type === TOKEN_ADDED || type === TOKEN_REMOVED)
    .reduce(getUserTokensReducer, []);

export const transformNotificationEventNames = (eventName: string): string => {
  const notificationsToEventsMapping = {
    ColonyAdministrationRoleSetAdded: NOTIFICATION_EVENT_ADMIN_ADDED,
    ColonyAdministrationRoleSetRemoved: NOTIFICATION_EVENT_ADMIN_REMOVED,
    ColonyLabelRegistered: NOTIFICATION_EVENT_COLONY_ENS_CREATED,
    DomainAdded: NOTIFICATION_EVENT_DOMAIN_ADDED,
    Mint: NOTIFICATION_EVENT_TOKENS_MINTED,
    Transfer: NOTIFICATION_EVENT_USER_TRANSFER,
  };
  return notificationsToEventsMapping[eventName];
};
