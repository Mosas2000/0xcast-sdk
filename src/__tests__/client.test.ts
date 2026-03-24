import { describe, it, expect } from 'vitest';
import { OxCast } from '../client';
import { NETWORKS } from '../constants';

describe('OxCast Client', () => {
  describe('constructor', () => {
    it('should create client with default mainnet config', () => {
      const client = new OxCast();
      expect(client.network).toBe('mainnet');
    });

    it('should create client with testnet config', () => {
      const client = new OxCast({ network: 'testnet' });
      expect(client.network).toBe('testnet');
    });

    it('should have markets, portfolio, and positions APIs', () => {
      const client = new OxCast();
      expect(client.markets).toBeDefined();
      expect(client.portfolio).toBeDefined();
      expect(client.positions).toBeDefined();
    });
  });

  describe('wallet connection', () => {
    it('should not have wallet connected by default', () => {
      const client = new OxCast();
      expect(client.isWalletConnected()).toBe(false);
      expect(client.getWalletAddress()).toBeUndefined();
    });

    it('should connect wallet', () => {
      const client = new OxCast();
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      
      client.connectWallet(address);
      
      expect(client.isWalletConnected()).toBe(true);
      expect(client.getWalletAddress()).toBe(address);
    });

    it('should disconnect wallet', () => {
      const client = new OxCast();
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      
      client.connectWallet(address);
      client.disconnectWallet();
      
      expect(client.isWalletConnected()).toBe(false);
      expect(client.getWalletAddress()).toBeUndefined();
    });
  });

  describe('network config', () => {
    it('should return correct contract address for mainnet', () => {
      const client = new OxCast({ network: 'mainnet' });
      expect(client.getContractAddress()).toBe(NETWORKS.mainnet.contractAddress);
    });

    it('should return correct contract address for testnet', () => {
      const client = new OxCast({ network: 'testnet' });
      expect(client.getContractAddress()).toBe(NETWORKS.testnet.contractAddress);
    });

    it('should generate correct explorer URL for transaction', () => {
      const client = new OxCast({ network: 'mainnet' });
      const txId = '0x123abc';
      const url = client.getExplorerUrl(txId);
      
      expect(url).toContain('explorer.stacks.co');
      expect(url).toContain(txId);
    });

    it('should generate correct explorer URL for address', () => {
      const client = new OxCast({ network: 'mainnet' });
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const url = client.getAddressExplorerUrl(address);
      
      expect(url).toContain('explorer.stacks.co');
      expect(url).toContain(address);
    });
  });
});
