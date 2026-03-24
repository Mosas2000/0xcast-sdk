import { describe, it, expect } from 'vitest';
import { MarketsApi } from '../markets';
import { InvalidParamsError } from '../errors';

describe('MarketsApi', () => {
  const api = new MarketsApi('mainnet');

  describe('get', () => {
    it('should reject empty market ID', async () => {
      await expect(api.get('')).rejects.toThrow(InvalidParamsError);
    });
  });

  describe('search', () => {
    it('should reject empty search query', async () => {
      await expect(api.search('')).rejects.toThrow(InvalidParamsError);
    });

    it('should reject whitespace-only query', async () => {
      await expect(api.search('   ')).rejects.toThrow(InvalidParamsError);
    });
  });
});
