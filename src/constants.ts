import type { NetworkType } from './types';

/**
 * Network configuration constants
 */
export const NETWORKS = {
  mainnet: {
    name: 'mainnet',
    apiUrl: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co',
    contractAddress: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
  },
  testnet: {
    name: 'testnet',
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    contractAddress: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9',
  },
} as const;

/**
 * Contract names
 */
export const CONTRACTS = {
  MARKET_CORE: 'market-core',
  MARKET_TRADING: 'market-trading',
  MARKET_RESOLUTION: 'market-resolution',
  AMM_POOL: 'amm-pool',
  GOVERNANCE: 'governance',
} as const;

/**
 * Default configuration values
 */
export const DEFAULTS = {
  /** Default network */
  network: 'mainnet' as NetworkType,
  /** Default pagination limit */
  pageLimit: 20,
  /** Maximum pagination limit */
  maxPageLimit: 100,
  /** Default slippage percentage */
  slippage: 1,
  /** Request timeout in ms */
  timeout: 30000,
} as const;

/**
 * STX denomination constants
 */
export const STX = {
  /** microSTX per STX */
  MICRO_PER_STX: 1_000_000n,
  /** Minimum trade amount in microSTX */
  MIN_TRADE: 100_000n, // 0.1 STX
  /** Platform fee percentage */
  FEE_PERCENT: 1, // 1%
} as const;

/**
 * Get network configuration
 */
export function getNetworkConfig(network: NetworkType) {
  return NETWORKS[network];
}
