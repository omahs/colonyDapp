/* @flow */

export const CONNECT_ROUTE = '/connect';
export const COLONY_HOME_ROUTE = '/colony/:colonyName';
export const TASK_ROUTE = `${COLONY_HOME_ROUTE}/task/:draftId`;
export const CREATE_COLONY_ROUTE = '/create-colony';
export const CREATE_USER_ROUTE = '/create-user';
export const CREATE_WALLET_ROUTE = '/create-wallet';
export const FOUR_O_FOUR_ROUTE = '/404';
export const DASHBOARD_ROUTE = '/dashboard';
export const INBOX_ROUTE = '/inbox';
export const USER_EDIT_ROUTE = '/edit-profile';
export const USER_ROUTE = '/user/:username';
export const WALLET_ROUTE = '/wallet';
export const ADMIN_DASHBOARD_ROUTE = `${COLONY_HOME_ROUTE}/admin`;
export const NOT_FOUND_ROUTE = '/404';
