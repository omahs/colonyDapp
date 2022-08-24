import { Network } from '@colony/colony-js';

import { Color } from '~core/ColorTag';

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals?: number;
};

export type NetworkInfo = {
  name: string;
  chainId: number;
  shortName: string;
  apiUri: string;
  description?: string;
  displayENSDomain?: string;
  /**
   * Used just to display references to the current networks's
   */
  blockExplorerName?: string;
  blockExplorerUrl?: string;
  /**
   * Link to a token list from the current network's block explorer.
   * This will just be used for information messages and tooltips.
   * We actually linking to it we have a method that generates the
   * link programatically: `getBlockExplorerLink()`
   */
  tokenExplorerLink?: string;
  contractAddressLink: string;
  /*
   * Used when adding the network to Metamask
   */
  rpcUrl?: string;
  /*
   * Used when interacting with Gnosis Safe Transaction Service
   */
  gnosisTxService?: string;
};

export const DEFAULT_NETWORK = process.env.NETWORK || Network.Goerli;
export const COLONY_TOTAL_BALANCE_DOMAIN_ID = 0;
export const DEFAULT_TOKEN_DECIMALS = 18;

export enum ROLES_COMMUNITY {
  founder = 'role.founder',
  admin = 'role.admin',
  member = 'role.member',
}

export const XDAI_TOKEN: TokenInfo = {
  /*
   * Needs to be this exact name, otherwise Metamask marks it as "not valid" when adding it
   */
  name: 'xDAI Token', //
  /*
   * Needs to be this exact name, otherwise Metamask marks it as "not valid" when adding it
   */
  symbol: 'xDAI',
  decimals: 18,
};

export const ETHER_TOKEN: TokenInfo = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

export const GOERLI_TOKEN: TokenInfo = {
  name: 'Goerli Ether',
  symbol: 'GOETH',
  decimals: 18,
};

export const GNOSIS_NETWORK: NetworkInfo = {
  /*
   * Needs to be this exact name, otherwise Metamask marks it as "not valid" when adding it
   */
  name: 'Gnosis Chain',
  chainId: 100,
  shortName: 'xDai',
  displayENSDomain: 'joincolony.colonyxdai',
  blockExplorerName: 'Blockscout',
  blockExplorerUrl: 'https://blockscout.com/poa/xdai',
  tokenExplorerLink: 'https://blockscout.com/poa/xdai/tokens',
  contractAddressLink: 'https://blockscout.com/poa/xdai/address',
  rpcUrl: 'https://rpc.gnosischain.com',
  apiUri: 'https://blockscout.com/xdai/mainnet/api',
  gnosisTxService: 'https://safe-transaction.xdai.gnosis.io/',
};

export const ETHEREUM_NETWORK: NetworkInfo = {
  name: 'Ethereum',
  chainId: 1,
  shortName: 'ETH',
  blockExplorerName: 'Etherscan',
  blockExplorerUrl: 'https://etherscan.io',
  displayENSDomain: 'joincolony.eth',
  tokenExplorerLink: 'https://etherscan.io/tokens',
  contractAddressLink: 'https://etherscan.io/address',
  rpcUrl: 'https://mainnet.infura.io/v3',
  apiUri: 'https://api.etherscan.io/api',
  gnosisTxService: 'https://safe-transaction.mainnet.gnosis.io/',
};

export const GOERLI_NETWORK: NetworkInfo = {
  name: 'Goerli Testnet',
  chainId: 5,
  shortName: 'GTH',
  blockExplorerName: 'Etherscan',
  blockExplorerUrl: 'https://goerli.etherscan.io',
  displayENSDomain: 'joincolony.eth',
  tokenExplorerLink: 'https://goerli.etherscan.io/tokens',
  contractAddressLink: 'https://goerli.etherscan.io/address',
  rpcUrl: 'https://goerli.infura.io/v3',
  apiUri: 'https://api-goerli.etherscan.io/api',
  gnosisTxService: 'https://safe-transaction.goerli.gnosis.io/',
};

const ARBITRUM_NETWORK: NetworkInfo = {
  name: 'Arbitrum',
  chainId: 42161,
  shortName: 'ETH',
  contractAddressLink: '',
  apiUri: 'https://api.arbiscan.io/api',
  gnosisTxService: 'https://safe-transaction.arbitrum.gnosis.io/',
};

const AURORA_NETWORK: NetworkInfo = {
  name: 'Aurora',
  chainId: 1313161554,
  shortName: 'ETH',
  contractAddressLink: '',
  apiUri: 'https://api.aurorascan.dev/api',
  gnosisTxService: 'https://safe-transaction.aurora.gnosis.io/',
};

const AVALANCHE_NETWORK: NetworkInfo = {
  name: 'Avalanche',
  chainId: 43114,
  shortName: 'AVAX',
  contractAddressLink: '',
  apiUri: 'https://api.snowtrace.io/api',
  gnosisTxService: 'https://safe-transaction.avalanche.gnosis.io/',
};

export const BINANCE_NETWORK: NetworkInfo = {
  name: 'Binance Smart Chain',
  chainId: 56,
  shortName: 'BNB',
  contractAddressLink: '',
  apiUri: 'https://api.bscscan.com/api',
  gnosisTxService: 'https://safe-transaction.bsc.gnosis.io/',
};

const OPTIMISM_NETWORK: NetworkInfo = {
  name: 'Optimism',
  chainId: 10,
  shortName: 'ETH',
  contractAddressLink: '',
  apiUri: 'https://api-optimistic.etherscan.io/api',
  gnosisTxService: 'https://safe-transaction.optimism.gnosis.io/',
};

export const POLYGON_NETWORK: NetworkInfo = {
  name: 'Polygon',
  chainId: 137,
  shortName: 'MATIC',
  contractAddressLink: '',
  apiUri: 'https://api.polygonscan.com/api',
  gnosisTxService: 'https://safe-transaction.polygon.gnosis.io/',
};

const RINKEBY_TEST_NETWORK: NetworkInfo = {
  name: 'Rinkeby Testnet',
  chainId: 4,
  shortName: 'RIN',
  contractAddressLink: '',
  apiUri: 'https://api-rinkeby.etherscan.io/api',
  gnosisTxService: 'https://safe-transaction.rinkeby.gnosis.io/',
};

/*
 * @NOTE Local Network
 * ChainId is manually set by us, since ganache randomizes it on each start
 */
export const GANACHE_NETWORK: NetworkInfo = {
  name: 'Local Ganache Instance',
  chainId: 1337,
  shortName: 'Ganache',
  blockExplorerName: 'Noexplorer',
  blockExplorerUrl: 'http://localhost',
  displayENSDomain: 'joincolony.eth',
  tokenExplorerLink: 'http://localhost',
  contractAddressLink: 'http://localhost',
  rpcUrl: 'http://localhost:8545',
  apiUri: '',
};

export const NETWORK_DATA: { [key: string]: NetworkInfo } = {
  [Network.Local]: GANACHE_NETWORK,
  [Network.Xdai]: GNOSIS_NETWORK,
  [Network.XdaiFork]: GNOSIS_NETWORK,
  [Network.Goerli]: GOERLI_NETWORK,
  [Network.Mainnet]: ETHEREUM_NETWORK,
};

export const TOKEN_DATA = {
  [Network.Local]: ETHER_TOKEN,
  [Network.Xdai]: XDAI_TOKEN,
  [Network.XdaiFork]: XDAI_TOKEN,
  [Network.Goerli]: GOERLI_TOKEN,
  [Network.Mainnet]: ETHER_TOKEN,
};

export const SUPPORTED_NETWORKS = {
  [GNOSIS_NETWORK.chainId]: GNOSIS_NETWORK,
  [ETHEREUM_NETWORK.chainId]: ETHEREUM_NETWORK,
  [GOERLI_NETWORK.chainId]: GOERLI_NETWORK,
  [GANACHE_NETWORK.chainId]: GANACHE_NETWORK,
};

export const GNOSIS_SAFE_NETWORKS: NetworkInfo[] = [
  GNOSIS_NETWORK,
  ETHEREUM_NETWORK,
  ARBITRUM_NETWORK,
  AURORA_NETWORK,
  AVALANCHE_NETWORK,
  BINANCE_NETWORK,
  OPTIMISM_NETWORK,
  POLYGON_NETWORK,
  GOERLI_NETWORK,
  RINKEBY_TEST_NETWORK,
];

export const DEFAULT_NETWORK_TOKEN = TOKEN_DATA[DEFAULT_NETWORK];

export const DEFAULT_NETWORK_INFO = NETWORK_DATA[DEFAULT_NETWORK];

export const ALLDOMAINS_DOMAIN_SELECTION = {
  id: String(COLONY_TOTAL_BALANCE_DOMAIN_ID),
  color: Color.Yellow,
  ethDomainId: COLONY_TOTAL_BALANCE_DOMAIN_ID,
  name: 'All Teams',
  ethParentDomainId: null,
  description: '',
};

export const SMALL_TOKEN_AMOUNT_FORMAT = '0.00000...';

export const SAFE_ALREADY_EXISTS = 'alreadyExists';
