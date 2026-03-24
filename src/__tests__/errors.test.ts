import { describe, it, expect } from 'vitest';
import {
  OxCastError,
  NetworkError,
  InvalidParamsError,
  MarketNotFoundError,
  InsufficientBalanceError,
  MarketClosedError,
  WalletNotConnectedError,
  ErrorCodes,
} from '../errors';

describe('Errors', () => {
  describe('OxCastError', () => {
    it('should create error with code and message', () => {
      const error = new OxCastError(ErrorCodes.NETWORK_ERROR, 'Connection failed');
      
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('OxCastError');
    });

    it('should create error with details', () => {
      const details = { endpoint: '/api/markets' };
      const error = new OxCastError(ErrorCodes.NETWORK_ERROR, 'Failed', details);
      
      expect(error.details).toEqual(details);
    });

    it('should serialize to JSON', () => {
      const error = new OxCastError(ErrorCodes.INVALID_PARAMS, 'Bad input', { field: 'amount' });
      const json = error.toJSON();
      
      expect(json).toEqual({
        name: 'OxCastError',
        code: 'INVALID_PARAMS',
        message: 'Bad input',
        details: { field: 'amount' },
      });
    });
  });

  describe('NetworkError', () => {
    it('should have NETWORK_ERROR code', () => {
      const error = new NetworkError('Timeout');
      
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('InvalidParamsError', () => {
    it('should have INVALID_PARAMS code', () => {
      const error = new InvalidParamsError('Amount required');
      
      expect(error.code).toBe('INVALID_PARAMS');
      expect(error.name).toBe('InvalidParamsError');
    });
  });

  describe('MarketNotFoundError', () => {
    it('should include market ID in message and details', () => {
      const error = new MarketNotFoundError('market-123');
      
      expect(error.code).toBe('MARKET_NOT_FOUND');
      expect(error.message).toContain('market-123');
      expect(error.details?.marketId).toBe('market-123');
    });
  });

  describe('InsufficientBalanceError', () => {
    it('should include required and available amounts', () => {
      const error = new InsufficientBalanceError(1000000n, 500000n);
      
      expect(error.code).toBe('INSUFFICIENT_BALANCE');
      expect(error.details?.required).toBe('1000000');
      expect(error.details?.available).toBe('500000');
    });
  });

  describe('MarketClosedError', () => {
    it('should include market ID', () => {
      const error = new MarketClosedError('market-456');
      
      expect(error.code).toBe('MARKET_CLOSED');
      expect(error.details?.marketId).toBe('market-456');
    });
  });

  describe('WalletNotConnectedError', () => {
    it('should have appropriate message', () => {
      const error = new WalletNotConnectedError();
      
      expect(error.code).toBe('WALLET_NOT_CONNECTED');
      expect(error.message).toContain('Wallet not connected');
    });
  });
});
