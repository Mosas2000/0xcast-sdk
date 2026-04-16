import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarketsApi } from '../markets';
import { InvalidParamsError, MarketNotFoundError } from '../errors';

describe('MarketsApi', () => {
  const api = new MarketsApi('mainnet');

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  describe('get error handling', () => {
    it('should map not found responses to market errors', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'MARKET_NOT_FOUND', message: 'Missing market' }), {
          status: 404,
          statusText: 'Not Found',
          headers: {
            'content-type': 'application/json',
          },
        })
      );

      vi.stubGlobal('fetch', fetchMock);

      await expect(api.get('market-404')).rejects.toBeInstanceOf(MarketNotFoundError);
    });
  });
});
