import { describe, it, expect } from 'vitest';
import {
  NETWORKS,
  CONTRACTS,
  DEFAULTS,
  STX,
  getNetworkConfig,
} from '../constants';

describe('Constants', () => {
  describe('NETWORKS', () => {
    it('should have mainnet configuration', () => {
      expect(NETWORKS.mainnet).toBeDefined();
      expect(NETWORKS.mainnet.name).toBe('mainnet');
      expect(NETWORKS.mainnet.apiUrl).toContain('mainnet');
      expect(NETWORKS.mainnet.contractAddress).toMatch(/^SP/);
    });

    it('should have testnet configuration', () => {
      expect(NETWORKS.testnet).toBeDefined();
      expect(NETWORKS.testnet.name).toBe('testnet');
      expect(NETWORKS.testnet.apiUrl).toContain('testnet');
      expect(NETWORKS.testnet.contractAddress).toMatch(/^ST/);
    });
  });

  describe('CONTRACTS', () => {
    it('should define all contract names', () => {
      expect(CONTRACTS.MARKET_CORE).toBe('market-core');
      expect(CONTRACTS.MARKET_TRADING).toBe('market-trading');
      expect(CONTRACTS.MARKET_RESOLUTION).toBe('market-resolution');
      expect(CONTRACTS.AMM_POOL).toBe('amm-pool');
      expect(CONTRACTS.GOVERNANCE).toBe('governance');
    });
  });

  describe('DEFAULTS', () => {
    it('should have sensible default values', () => {
      expect(DEFAULTS.network).toBe('mainnet');
      expect(DEFAULTS.pageLimit).toBeGreaterThan(0);
      expect(DEFAULTS.maxPageLimit).toBeGreaterThan(DEFAULTS.pageLimit);
      expect(DEFAULTS.slippage).toBeGreaterThan(0);
      expect(DEFAULTS.timeout).toBeGreaterThan(0);
    });
  });

  describe('STX', () => {
    it('should have correct micro STX conversion', () => {
      expect(STX.MICRO_PER_STX).toBe(1_000_000n);
    });

    it('should have minimum trade amount', () => {
      expect(STX.MIN_TRADE).toBeGreaterThan(0n);
    });

    it('should have fee percentage', () => {
      expect(STX.FEE_PERCENT).toBeGreaterThanOrEqual(0);
      expect(STX.FEE_PERCENT).toBeLessThan(100);
    });
  });

  describe('getNetworkConfig', () => {
    it('should return mainnet config', () => {
      const config = getNetworkConfig('mainnet');
      expect(config).toEqual(NETWORKS.mainnet);
    });

    it('should return testnet config', () => {
      const config = getNetworkConfig('testnet');
      expect(config).toEqual(NETWORKS.testnet);
    });
  });
});
