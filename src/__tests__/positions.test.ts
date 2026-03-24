import { describe, it, expect } from 'vitest';
import { PositionsApi } from '../positions';
import { InvalidParamsError, WalletNotConnectedError } from '../errors';
import { STX } from '../constants';

describe('PositionsApi', () => {
  const api = new PositionsApi('mainnet');

  describe('wallet management', () => {
    it('should not be connected by default', () => {
      const positionsApi = new PositionsApi('mainnet');
      expect(positionsApi.isConnected()).toBe(false);
    });

    it('should connect wallet', () => {
      const positionsApi = new PositionsApi('mainnet');
      positionsApi.setWallet('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
      expect(positionsApi.isConnected()).toBe(true);
    });

    it('should clear wallet', () => {
      const positionsApi = new PositionsApi('mainnet');
      positionsApi.setWallet('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
      positionsApi.clearWallet();
      expect(positionsApi.isConnected()).toBe(false);
    });
  });

  describe('order validation', () => {
    it('should reject missing market ID', async () => {
      await expect(
        api.getBuyQuote({
          marketId: '',
          outcome: 'YES',
          amount: 1000000n,
        })
      ).rejects.toThrow(InvalidParamsError);
    });

    it('should reject invalid outcome', async () => {
      await expect(
        api.getBuyQuote({
          marketId: 'market-1',
          outcome: 'MAYBE' as any,
          amount: 1000000n,
        })
      ).rejects.toThrow(InvalidParamsError);
    });

    it('should reject zero amount', async () => {
      await expect(
        api.getBuyQuote({
          marketId: 'market-1',
          outcome: 'YES',
          amount: 0n,
        })
      ).rejects.toThrow(InvalidParamsError);
    });

    it('should reject amount below minimum', async () => {
      await expect(
        api.getBuyQuote({
          marketId: 'market-1',
          outcome: 'YES',
          amount: STX.MIN_TRADE - 1n,
        })
      ).rejects.toThrow(InvalidParamsError);
    });
  });

  describe('transaction building', () => {
    it('should require wallet connection for buy transaction', async () => {
      const positionsApi = new PositionsApi('mainnet');
      
      await expect(
        positionsApi.buildBuyTransaction({
          marketId: 'market-1',
          outcome: 'YES',
          amount: 1000000n,
        })
      ).rejects.toThrow(WalletNotConnectedError);
    });

    it('should require wallet connection for sell transaction', async () => {
      const positionsApi = new PositionsApi('mainnet');
      
      await expect(
        positionsApi.buildSellTransaction({
          marketId: 'market-1',
          outcome: 'NO',
          amount: 100n,
        })
      ).rejects.toThrow(WalletNotConnectedError);
    });
  });
});
