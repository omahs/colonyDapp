/* eslint-disable prettier/prettier, max-len */

/*
 * Please try to keep this list in alphabetical order :-)
 * (hopefully your editor can do it!)
 */
export enum ActionTypes {
  COLONY_CLAIM_TOKEN = 'COLONY_CLAIM_TOKEN',
  COLONY_CLAIM_TOKEN_ERROR = 'COLONY_CLAIM_TOKEN_ERROR',
  COLONY_CLAIM_TOKEN_SUCCESS = 'COLONY_CLAIM_TOKEN_SUCCESS',
  COLONY_CREATE = 'COLONY_CREATE',
  COLONY_CREATE_CANCEL = 'COLONY_CREATE_CANCEL',
  COLONY_CREATE_ERROR = 'COLONY_CREATE_ERROR',
  COLONY_CREATE_SUCCESS = 'COLONY_CREATE_SUCCESS',
  COLONY_DEPLOYMENT_RESTART = 'COLONY_DEPLOYMENT_RESTART',
  COLONY_DEPLOYMENT_RESTART_ERROR = 'COLONY_DEPLOYMENT_RESTART_ERROR',
  COLONY_DEPLOYMENT_RESTART_SUCCESS = 'COLONY_DEPLOYMENT_RESTART_SUCCESS',
  COLONY_RECOVERY_MODE_ENTER = 'COLONY_RECOVERY_MODE_ENTER',
  COLONY_RECOVERY_MODE_ENTER_ERROR = 'COLONY_RECOVERY_MODE_ENTER_ERROR',
  COLONY_RECOVERY_MODE_ENTER_SUCCESS = 'COLONY_RECOVERY_MODE_ENTER_SUCCESS',
  COLONY_EXTENSION_ENABLE = 'COLONY_EXTENSION_ENABLE',
  COLONY_EXTENSION_ENABLE_ERROR = 'COLONY_EXTENSION_ENABLE_ERROR',
  COLONY_EXTENSION_ENABLE_SUCCESS = 'COLONY_EXTENSION_ENABLE_SUCCESS',
  COLONY_EXTENSION_INSTALL = 'COLONY_EXTENSION_INSTALL',
  COLONY_EXTENSION_INSTALL_ERROR = 'COLONY_EXTENSION_INSTALL_ERROR',
  COLONY_EXTENSION_INSTALL_SUCCESS = 'COLONY_EXTENSION_INSTALL_SUCCESS',
  COLONY_EXTENSION_DEPRECATE= 'COLONY_EXTENSION_DEPRECATE',
  COLONY_EXTENSION_DEPRECATE_ERROR = 'COLONY_EXTENSION_DEPRECATE_ERROR',
  COLONY_EXTENSION_DEPRECATE_SUCCESS = 'COLONY_EXTENSION_DEPRECATE_SUCCESS',
  COLONY_EXTENSION_UNINSTALL = 'COLONY_EXTENSION_UNINSTALL',
  COLONY_EXTENSION_UNINSTALL_ERROR = 'COLONY_EXTENSION_UNINSTALL_ERROR',
  COLONY_EXTENSION_UNINSTALL_SUCCESS = 'COLONY_EXTENSION_UNINSTALL_SUCCESS',
  COLONY_EXTENSION_UPGRADE = 'COLONY_EXTENSION_UPGRADE',
  COLONY_EXTENSION_UPGRADE_ERROR = 'COLONY_EXTENSION_UPGRADE_ERROR',
  COLONY_EXTENSION_UPGRADE_SUCCESS = 'COLONY_EXTENSION_UPGRADE_SUCCESS',
  /*
   * Actions
   */
  COLONY_ACTION_DOMAIN_CREATE = 'COLONY_ACTION_DOMAIN_CREATE',
  COLONY_ACTION_DOMAIN_CREATE_ERROR = 'COLONY_ACTION_DOMAIN_CREATE_ERROR',
  COLONY_ACTION_DOMAIN_CREATE_SUCCESS = 'COLONY_ACTION_DOMAIN_CREATE_SUCCESS',
  COLONY_ACTION_DOMAIN_EDIT = 'COLONY_ACTION_DOMAIN_EDIT',
  COLONY_ACTION_DOMAIN_EDIT_ERROR = 'COLONY_ACTION_DOMAIN_EDIT_ERROR',
  COLONY_ACTION_DOMAIN_EDIT_SUCCESS = 'COLONY_ACTION_DOMAIN_EDIT_SUCCESS',
  /*
   * @NOTE These are generic actions use for placeholders
   * They are not, and should not be wired to any dispatch action
   */
  COLONY_ACTION_GENERIC = 'COLONY_ACTION_GENERIC',
  COLONY_ACTION_GENERIC_ERROR = 'COLONY_ACTION_GENERIC_ERROR',
  COLONY_ACTION_GENERIC_SUCCESS = 'COLONY_ACTION_GENERIC_SUCCESS',
  COLONY_ACTION_EXPENDITURE_PAYMENT = 'COLONY_ACTION_EXPENDITURE_PAYMENT',
  COLONY_ACTION_EXPENDITURE_PAYMENT_ERROR = 'COLONY_ACTION_EXPENDITURE_PAYMENT_ERROR',
  COLONY_ACTION_EXPENDITURE_PAYMENT_SUCCESS = 'COLONY_ACTION_EXPENDITURE_PAYMENT_SUCCESS',
  COLONY_ACTION_EDIT_COLONY = 'COLONY_ACTION_EDIT_COLONY',
  COLONY_ACTION_EDIT_COLONY_ERROR = 'COLONY_ACTION_EDIT_COLONY_ERROR',
  COLONY_ACTION_EDIT_COLONY_SUCCESS = 'COLONY_ACTION_EDIT_COLONY_SUCCESS',
  COLONY_ACTION_MINT_TOKENS = 'COLONY_ACTION_MINT_TOKENS',
  COLONY_ACTION_MINT_TOKENS_ERROR = 'COLONY_ACTION_MINT_TOKENS_ERROR',
  COLONY_ACTION_MINT_TOKENS_SUCCESS = 'COLONY_ACTION_MINT_TOKENS_SUCCESS',
  COLONY_ACTION_MOVE_FUNDS = 'COLONY_ACTION_MOVE_FUNDS',
  COLONY_ACTION_MOVE_FUNDS_ERROR = 'COLONY_ACTION_MOVE_FUNDS_ERROR',
  COLONY_ACTION_MOVE_FUNDS_SUCCESS = 'COLONY_ACTION_MOVE_FUNDS_SUCCESS',
  COLONY_ACTION_RECOVERY = 'COLONY_ACTION_RECOVERY',
  COLONY_ACTION_RECOVERY_ERROR = 'COLONY_ACTION_RECOVERY_ERROR',
  COLONY_ACTION_RECOVERY_SUCCESS = 'COLONY_ACTION_RECOVERY_SUCCESS',
  COLONY_ACTION_RECOVERY_SET_SLOT = 'COLONY_ACTION_RECOVERY_SET_SLOT',
  COLONY_ACTION_RECOVERY_SET_SLOT_ERROR = 'COLONY_ACTION_RECOVERY_SET_SLOT_ERROR',
  COLONY_ACTION_RECOVERY_SET_SLOT_SUCCESS = 'COLONY_ACTION_RECOVERY_SET_SLOT_SUCCESS',
  COLONY_ACTION_RECOVERY_APPROVE = 'COLONY_ACTION_RECOVERY_APPROVE',
  COLONY_ACTION_RECOVERY_APPROVE_ERROR = 'COLONY_ACTION_RECOVERY_APPROVE_ERROR',
  COLONY_ACTION_RECOVERY_APPROVE_SUCCESS = 'COLONY_ACTION_RECOVERY_APPROVE_SUCCESS',
  COLONY_ACTION_RECOVERY_EXIT = 'COLONY_ACTION_RECOVERY_EXIT',
  COLONY_ACTION_RECOVERY_EXIT_ERROR = 'COLONY_ACTION_RECOVERY_EXIT_ERROR',
  COLONY_ACTION_RECOVERY_EXIT_SUCCESS = 'COLONY_ACTION_RECOVERY_EXIT_SUCCESS',
  COLONY_ACTION_MANAGE_REPUTATION = 'COLONY_ACTION_MANAGE_REPUTATION',
  COLONY_ACTION_MANAGE_REPUTATION_ERROR = 'COLONY_ACTION_MANAGE_REPUTATION_ERROR',
  COLONY_ACTION_MANAGE_REPUTATION_SUCCESS = 'COLONY_ACTION_MANAGE_REPUTATION_SUCCESS',
  COLONY_ACTION_VERSION_UPGRADE = 'COLONY_ACTION_VERSION_UPGRADE',
  COLONY_ACTION_VERSION_UPGRADE_ERROR = 'COLONY_ACTION_VERSION_UPGRADE_ERROR',
  COLONY_ACTION_VERSION_UPGRADE_SUCCESS = 'COLONY_ACTION_VERSION_UPGRADE_SUCCESS',
  COLONY_ACTION_USER_ROLES_SET = 'COLONY_ACTION_USER_ROLES_SET',
  COLONY_ACTION_USER_ROLES_SET_ERROR = 'COLONY_ACTION_USER_ROLES_SET_ERROR',
  COLONY_ACTION_USER_ROLES_SET_SUCCESS = 'COLONY_ACTION_USER_ROLES_SET_SUCCESS',
  COLONY_ACTION_UNLOCK_TOKEN = 'COLONY_ACTION_UNLOCK_TOKEN',
  COLONY_ACTION_UNLOCK_TOKEN_ERROR = 'COLONY_ACTION_UNLOCK_TOKEN_ERROR',
  COLONY_ACTION_UNLOCK_TOKEN_SUCCESS = 'COLONY_ACTION_UNLOCK_TOKEN_SUCCESS',

  COLONY_VERIFIED_RECIPIENTS_MANAGE = 'COLONY_VERIFIED_RECIPIENTS_MANAGE',
  COLONY_VERIFIED_RECIPIENTS_MANAGE_SUCCESS = 'COLONY_VERIFIED_RECIPIENTS_MANAGE_SUCCESS',
  COLONY_VERIFIED_RECIPIENTS_MANAGE_ERROR  = 'COLONY_VERIFIED_RECIPIENTS_MANAGE_ERROR ',
  /*
   * Motions
   */
  COLONY_MOTION_STAKE = 'COLONY_MOTION_STAKE',
  COLONY_MOTION_STAKE_ERROR = 'COLONY_MOTION_STAKE_ERROR',
  COLONY_MOTION_STAKE_SUCCESS = 'COLONY_MOTION_STAKE_SUCCESS',
  COLONY_MOTION_VOTE = 'COLONY_MOTION_VOTE',
  COLONY_MOTION_VOTE_ERROR = 'COLONY_MOTION_VOTE_ERROR',
  COLONY_MOTION_VOTE_SUCCESS = 'COLONY_MOTION_VOTE_SUCCESS',
  COLONY_MOTION_REVEAL_VOTE = 'COLONY_MOTION_REVEAL_VOTE',
  COLONY_MOTION_REVEAL_VOTE_ERROR = 'COLONY_MOTION_REVEAL_VOTE_ERROR',
  COLONY_MOTION_REVEAL_VOTE_SUCCESS = 'COLONY_MOTION_REVEAL_VOTE_SUCCESS',
  COLONY_MOTION_FINALIZE = 'COLONY_MOTION_FINALIZE',
  COLONY_MOTION_FINALIZE_ERROR = 'COLONY_MOTION_FINALIZE_ERROR',
  COLONY_MOTION_FINALIZE_SUCCESS = 'COLONY_MOTION_FINALIZE_SUCCESS',
  COLONY_MOTION_CLAIM = 'COLONY_MOTION_CLAIM',
  COLONY_MOTION_CLAIM_ERROR = 'COLONY_MOTION_CLAIM_ERROR',
  COLONY_MOTION_CLAIM_SUCCESS = 'COLONY_MOTION_CLAIM_SUCCESS',
  COLONY_MOTION_DOMAIN_CREATE_EDIT = 'COLONY_MOTION_DOMAIN_CREATE_EDIT',
  COLONY_MOTION_DOMAIN_CREATE_EDIT_ERROR = 'COLONY_MOTION_DOMAIN_CREATE_EDIT_ERROR',
  COLONY_MOTION_DOMAIN_CREATE_EDIT_SUCCESS = 'COLONY_MOTION_DOMAIN_CREATE_EDIT_SUCCESS',
  COLONY_MOTION_EDIT_COLONY = 'COLONY_MOTION_EDIT_COLONY',
  COLONY_MOTION_EDIT_COLONY_ERROR = 'COLONY_MOTION_EDIT_COLONY_ERROR',
  COLONY_MOTION_EDIT_COLONY_SUCCESS = 'COLONY_MOTION_EDIT_COLONY_SUCCESS',
  COLONY_MOTION_EXPENDITURE_PAYMENT = 'COLONY_MOTION_EXPENDITURE_PAYMENT',
  COLONY_MOTION_EXPENDITURE_PAYMENT_ERROR = 'COLONY_MOTION_EXPENDITURE_PAYMENT_ERROR',
  COLONY_MOTION_EXPENDITURE_PAYMENT_SUCCESS = 'COLONY_MOTION_EXPENDITURE_PAYMENT_SUCCESS',
  COLONY_MOTION_MOVE_FUNDS = 'COLONY_MOTION_MOVE_FUNDS',
  COLONY_MOTION_MOVE_FUNDS_ERROR = 'COLONY_MOTION_MOVE_FUNDS_ERROR',
  COLONY_MOTION_MOVE_FUNDS_SUCCESS = 'COLONY_MOTION_MOVE_FUNDS_SUCCESS',
  COLONY_MOTION_USER_ROLES_SET = 'COLONY_MOTION_USER_ROLES_SET',
  COLONY_MOTION_USER_ROLES_SET_ERROR = 'COLONY_MOTION_USER_ROLES_SET_ERROR',
  COLONY_MOTION_USER_ROLES_SET_SUCCESS = 'COLONY_MOTION_USER_ROLES_SET_SUCCESS',
  COLONY_ROOT_MOTION = 'COLONY_ROOT_MOTION',
  COLONY_ROOT_MOTION_ERROR = 'COLONY_ROOT_MOTION_ERROR',
  COLONY_ROOT_MOTION_SUCCESS = 'COLONY_ROOT_MOTION_SUCCESS',
  COLONY_MOTION_STATE_UPDATE = 'COLONY_MOTION_STATE_UPDATE',
  COLONY_MOTION_STATE_UPDATE_ERROR = 'COLONY_MOTION_STATE_UPDATE_ERROR',
  COLONY_MOTION_STATE_UPDATE_SUCCESS = 'COLONY_MOTION_STATE_UPDATE_SUCCESS',
  COLONY_MOTION_ESCALATE = 'COLONY_MOTION_ESCALATE',
  COLONY_MOTION_ESCALATE_ERROR = 'COLONY_MOTION_ESCALATE_ERROR',
  COLONY_MOTION_ESCALATE_SUCCESS = 'COLONY_MOTION_ESCALATE_SUCCESS',
  COLONY_MOTION_MANAGE_REPUTATION = 'COLONY_MOTION_MANAGE_REPUTATION',
  COLONY_MOTION_MANAGE_REPUTATION_ERROR = 'COLONY_MOTION_MANAGE_REPUTATION_ERROR',
  COLONY_MOTION_MANAGE_REPUTATION_SUCCESS = 'COLONY_MOTION_MANAGE_REPUTATION_SUCCESS',
  /*
   * Whitelist
   */
  WHITELIST_ENABLE = 'WHITELIST_ENABLE',
  WHITELIST_ENABLE_ERROR = 'WHITELIST_ENABLE_ERROR',
  WHITELIST_ENABLE_SUCCESS = 'WHITELIST_ENABLE_SUCCESS',
  WHITELIST_UPDATE = 'WHITELIST_UPDATE',
  WHITELIST_UPDATE_SUCCESS = 'WHITELIST_UPDATE_SUCCESS',
  WHITELIST_UPDATE_ERROR = 'WHITELIST_UPDATE_ERROR',
  WHITELIST_SIGN_AGREEMENT = 'WHITELIST_SIGN_AGREEMENT',
  WHITELIST_SIGN_AGREEMENT_ERROR = 'WHITELIST_SIGN_AGREEMENT_ERROR',
  WHITELIST_SIGN_AGREEMENT_SUCCESS = 'WHITELIST_SIGN_AGREEMENT_SUCCESS',
  /*
   * Coin Machine
   */
  COIN_MACHINE_BUY_TOKENS = 'COIN_MACHINE_BUY_TOKENS',
  COIN_MACHINE_BUY_TOKENS_ERROR = 'COIN_MACHINE_BUY_TOKENS_ERROR',
  COIN_MACHINE_BUY_TOKENS_SUCCESS = 'COIN_MACHINE_BUY_TOKENS_SUCCESS',
  COIN_MACHINE_ENABLE = 'COIN_MACHINE_ENABLE',
  COIN_MACHINE_ENABLE_ERROR = 'COIN_MACHINE_ENABLE_ERROR',
  COIN_MACHINE_ENABLE_SUCCESS = 'COIN_MACHINE_ENABLE_SUCCESS',
  COIN_MACHINE_PERIOD_UPDATE = 'COIN_MACHINE_PERIOD_UPDATE',
  COIN_MACHINE_PERIOD_UPDATE_ERROR = 'COIN_MACHINE_PERIOD_UPDATE_ERROR',
  COIN_MACHINE_PERIOD_UPDATE_SUCCESS = 'COIN_MACHINE_PERIOD_UPDATE_SUCCESS',
  /*
   * Other
   */
  CONNECTION_STATS_SUB_ERROR = 'CONNECTION_STATS_SUB_ERROR',
  CONNECTION_STATS_SUB_EVENT = 'CONNECTION_STATS_SUB_EVENT',
  CONNECTION_STATS_SUB_START = 'CONNECTION_STATS_SUB_START',
  CONNECTION_STATS_SUB_STOP = 'CONNECTION_STATS_SUB_STOP',
  GAS_PRICES_UPDATE = 'GAS_PRICES_UPDATE',
  IPFS_DATA_FETCH = 'IPFS_DATA_FETCH',
  IPFS_DATA_FETCH_ERROR = 'IPFS_DATA_FETCH_ERROR',
  IPFS_DATA_FETCH_SUCCESS = 'IPFS_DATA_FETCH_SUCCESS',
  IPFS_DATA_UPLOAD = 'IPFS_DATA_UPLOAD',
  IPFS_DATA_UPLOAD_ERROR = 'IPFS_DATA_UPLOAD_ERROR',
  IPFS_DATA_UPLOAD_SUCCESS = 'IPFS_DATA_UPLOAD_SUCCESS',
  MESSAGE_CANCEL = 'MESSAGE_CANCEL',
  MESSAGE_CREATED = 'MESSAGE_CREATED',
  MESSAGE_ERROR = 'MESSAGE_ERROR',
  MESSAGE_SIGN = 'MESSAGE_SIGN',
  MESSAGE_SIGNED = 'MESSAGE_SIGNED',
  MULTISIG_TRANSACTION_CREATED = 'MULTISIG_TRANSACTION_CREATED',
  MULTISIG_TRANSACTION_REFRESHED = 'MULTISIG_TRANSACTION_REFRESHED',
  MULTISIG_TRANSACTION_REJECT = 'MULTISIG_TRANSACTION_REJECT',
  MULTISIG_TRANSACTION_SIGN = 'MULTISIG_TRANSACTION_SIGN',
  MULTISIG_TRANSACTION_SIGNED = 'MULTISIG_TRANSACTION_SIGNED',
  TRANSACTION_ADD_IDENTIFIER = 'TRANSACTION_ADD_IDENTIFIER',
  TRANSACTION_ADD_PARAMS = 'TRANSACTION_ADD_PARAMS',
  TRANSACTION_CANCEL = 'TRANSACTION_CANCEL',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  TRANSACTION_ESTIMATE_GAS = 'TRANSACTION_ESTIMATE_GAS',
  TRANSACTION_GAS_UPDATE = 'TRANSACTION_GAS_UPDATE',
  TRANSACTION_HASH_RECEIVED = 'TRANSACTION_HASH_RECEIVED',
  TRANSACTION_LOAD_RELATED = 'TRANSACTION_LOAD_RELATED',
  TRANSACTION_READY = 'TRANSACTION_READY',
  TRANSACTION_PENDING = 'TRANSACTION_PENDING',
  TRANSACTION_RECEIPT_RECEIVED = 'TRANSACTION_RECEIPT_RECEIVED',
  TRANSACTION_SEND = 'TRANSACTION_SEND',
  TRANSACTION_SENT = 'TRANSACTION_SENT',
  TRANSACTION_SUCCEEDED = 'TRANSACTION_SUCCEEDED',
  TRANSACTION_RETRY = 'TRANSACTION_RETRY',
  USER_AVATAR_REMOVE = 'USER_AVATAR_REMOVE',
  USER_AVATAR_REMOVE_ERROR = 'USER_AVATAR_REMOVE_ERRROR',
  USER_AVATAR_REMOVE_SUCCESS = 'USER_AVATAR_REMOVE_SUCCESS',
  USER_AVATAR_UPLOAD = 'USER_AVATAR_UPLOAD',
  USER_AVATAR_UPLOAD_ERROR = 'USER_AVATAR_UPLOAD_ERRROR',
  USER_AVATAR_UPLOAD_SUCCESS = 'USER_AVATAR_UPLOAD_SUCCESS',
  USER_CONNECTED = 'USER_CONNECTED',
  USER_CONTEXT_SETUP_SUCCESS = 'USER_CONTEXT_SETUP_SUCCESS',
  USER_DEPOSIT_TOKEN = 'USER_DEPOSIT_TOKEN',
  USER_DEPOSIT_TOKEN_ERROR = 'USER_DEPOSIT_TOKEN_ERROR',
  USER_DEPOSIT_TOKEN_SUCCESS = 'USER_DEPOSIT_TOKEN_SUCCESS',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGOUT_ERROR = 'USER_LOGOUT_ERROR',
  USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS',
  USER_WITHDRAW_TOKEN = 'USER_WITHDRAW_TOKEN',
  USER_WITHDRAW_TOKEN_ERROR = 'USER_WITHDRAW_TOKEN_ERROR',
  USER_WITHDRAW_TOKEN_SUCCESS = 'USER_WITHDRAW_TOKEN_SUCCESS',
  USERNAME_CREATE = 'USERNAME_CREATE',
  USERNAME_CREATE_ERROR = 'USERNAME_CREATE_ERROR',
  USERNAME_CREATE_SUCCESS = 'USERNAME_CREATE_SUCCESS',
  WALLET_CREATE = 'WALLET_CREATE',
  WALLET_CREATE_ERROR = 'WALLET_CREATE_ERROR',
  WALLET_CREATE_SUCCESS = 'WALLET_CREATE_SUCCESS',
  /*
   * Metacolony vesting and claiming
   */
  META_CLAIM_ALLOCATION = 'META_CLAIM_ALLOCATION',
  META_CLAIM_ALLOCATION_ERROR = 'META_CLAIM_ALLOCATION_ERROR',
  META_CLAIM_ALLOCATION_SUCCESS = 'META_CLAIM_ALLOCATION_SUCCESS',
  META_UNWRAP_TOKEN = 'META_UNWRAP_TOKEN',
  META_UNWRAP_TOKEN_ERROR = 'META_UNWRAP_TOKEN_ERROR',
  META_UNWRAP_TOKEN_SUCCESS = 'META_UNWRAP_TOKEN_SUCCESS',
}
