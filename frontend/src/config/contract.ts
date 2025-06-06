// Contract configuration for deployed escrow contract
import contractMetadata from './escrow_contract.json';

export const CONTRACT_CONFIG = {
  // Deployed contract address on Aleph Zero testnet
  // TODO: Replace with your actual contract address from the Contracts UI
  ADDRESS: '5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU',
  
  // Network configuration
  NETWORK: {
    WS_ENDPOINT: 'wss://ws.test.azero.dev',
    NAME: 'Aleph Zero Testnet',
    CURRENCY: 'TZERO',
    DECIMALS: 12,
    SS58_PREFIX: 42
  },
  
  // Contract metadata (ABI) from compiled contract
  METADATA: contractMetadata
};

// Gas limits for different operations
export const GAS_LIMITS = {
  CREATE_ESCROW: 50000000000, // 50B units
  COMPLETE_ESCROW: 20000000000, // 20B units  
  CANCEL_ESCROW: 20000000000, // 20B units
  GET_ESCROW: 10000000000, // 10B units (read-only)
  GET_USER_ESCROWS: 10000000000, // 10B units (read-only)
};