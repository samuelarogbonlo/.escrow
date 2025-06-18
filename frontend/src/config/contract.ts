// Contract configuration for deployed escrow contract
import contractMetadata from './escrow_contract.json';

export const CONTRACT_CONFIG = {
  // Deployed contract address - supports multiple networks
  ADDRESS: {
    ALEPH_ZERO_TESTNET: '5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU',
    WESTEND_ASSET_HUB: '', // TODO: Deploy to Westend Asset Hub
    POLKADOT_ASSET_HUB: '', // TODO: Deploy to Polkadot Asset Hub (future)
  },
  
  // Network configurations
  NETWORKS: {
    ALEPH_ZERO_TESTNET: {
      WS_ENDPOINT: 'wss://ws.test.azero.dev',
      NAME: 'Aleph Zero Testnet',
      CURRENCY: 'TZERO',
      DECIMALS: 12,
      SS58_PREFIX: 42,
      CHAIN_TYPE: 'substrate',
      EXPLORER: 'https://test.azero.dev',
      FAUCET: 'https://faucet.test.azero.dev'
    },
    WESTEND_ASSET_HUB: {
      WS_ENDPOINT: 'wss://westend-asset-hub-rpc.polkadot.io',
      NAME: 'Westend Asset Hub',
      CURRENCY: 'WND',
      DECIMALS: 12,
      SS58_PREFIX: 42,
      CHAIN_TYPE: 'parachain',
      RELAY_CHAIN: 'westend',
      PARA_ID: 1000
    },
    POLKADOT_ASSET_HUB: {
      WS_ENDPOINT: 'wss://polkadot-asset-hub-rpc.polkadot.io',
      NAME: 'Polkadot Asset Hub',
      CURRENCY: 'DOT',
      DECIMALS: 10,
      SS58_PREFIX: 0,
      CHAIN_TYPE: 'parachain',
      RELAY_CHAIN: 'polkadot',
      PARA_ID: 1000
    }
  },
  
  // Contract metadata (ABI) from compiled contract
  METADATA: contractMetadata,
  
  // Default network
  DEFAULT_NETWORK: 'ALEPH_ZERO_TESTNET'
};

// USDT Asset configuration for different networks
export const USDT_CONFIG = {
  WESTEND_ASSET_HUB: {
    // Westend Asset Hub USDT asset ID (testnet)
    ASSET_ID: 2022, // Westend USDT - You have 3,000 balance!
    DECIMALS: 6,
    SYMBOL: 'USDT',
    NAME: 'Westend USDT',
    CONTRACT_ADDRESS: '', // To be populated after deployment
  },
  POLKADOT_ASSET_HUB: {
    // Polkadot Asset Hub USDT asset ID (mainnet)
    ASSET_ID: 1984, // Official USDT asset ID on Polkadot Asset Hub
    DECIMALS: 6,
    SYMBOL: 'USDT',
    NAME: 'Tether USD',
    CONTRACT_ADDRESS: '', // To be populated after deployment
  },
  ALEPH_ZERO_TESTNET: {
    // Mock USDT for Aleph Zero (for testing)
    ASSET_ID: null, // No native assets, use PSP22 contract
    DECIMALS: 6,
    SYMBOL: 'USDT',
    NAME: 'Tether USD (Test)',
    CONTRACT_ADDRESS: '5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU', // Placeholder
  }
};

// Gas limits for different operations
export const GAS_LIMITS = {
  CREATE_ESCROW: 50000000000, // 50B units
  COMPLETE_ESCROW: 20000000000, // 20B units  
  CANCEL_ESCROW: 20000000000, // 20B units
  GET_ESCROW: 10000000000, // 10B units (read-only)
  GET_USER_ESCROWS: 10000000000, // 10B units (read-only)
  
  // Asset Hub specific operations
  ASSET_TRANSFER: 5000000000, // 5B units
  ASSET_APPROVE: 5000000000, // 5B units
  ASSET_BALANCE: 1000000000, // 1B units (read-only)
};