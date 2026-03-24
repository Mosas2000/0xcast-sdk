import { describe, it, expect } from 'vitest';
import { PortfolioApi } from '../portfolio';
import { InvalidParamsError } from '../errors';

describe('PortfolioApi', () => {
  const api = new PortfolioApi('mainnet');

  describe('address validation', () => {
    it('should reject empty address', async () => {
      await expect(api.get('')).rejects.toThrow(InvalidParamsError);
    });

    it('should reject invalid address format', async () => {
      await expect(api.get('invalid-address')).rejects.toThrow(InvalidParamsError);
    });

    it('should reject address not starting with SP or ST', async () => {
      await expect(api.get('AB2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).rejects.toThrow(InvalidParamsError);
    });

    it('should reject address with invalid length', async () => {
      await expect(api.get('SP123')).rejects.toThrow(InvalidParamsError);
    });
  });

  describe('getMarketPositions', () => {
    it('should reject empty market ID', async () => {
      await expect(
        api.getMarketPositions('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', '')
      ).rejects.toThrow(InvalidParamsError);
    });
  });
});
