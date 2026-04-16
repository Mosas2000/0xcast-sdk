import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../http';
import { ErrorCodes, NetworkError } from '../errors';

describe('HttpClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('sends GET requests with query params and API key headers', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 'market-1' }] }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      })
    );

    const client = new HttpClient('mainnet', 'api-key', 'https://example.com');
    const result = await client.get<{ data: { id: string }[] }>('/markets', {
      page: 2,
      search: 'election',
    });

    expect(result).toEqual({ data: [{ id: 'market-1' }] });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/markets?page=2&search=election',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-API-Key': 'api-key',
        }),
      })
    );
  });

  it('maps rate limits to SDK errors', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'RATE_LIMITED', message: 'Slow down' }), {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'content-type': 'application/json',
        },
      })
    );

    const client = new HttpClient('mainnet');

    await expect(client.get('/markets')).rejects.toMatchObject({
      code: ErrorCodes.RATE_LIMITED,
      message: 'Slow down',
    });
  });

  it('wraps server errors with status details', async () => {
    fetchMock.mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    const client = new HttpClient('mainnet');

    await expect(client.get('/markets')).rejects.toMatchObject({
      code: ErrorCodes.NETWORK_ERROR,
      message: 'HTTP 500: Internal Server Error',
      details: { status: 500 },
    });
  });

  it('throws a network error on invalid JSON success responses', async () => {
    fetchMock.mockResolvedValue(
      new Response('not-json', {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      })
    );

    const client = new HttpClient('mainnet');

    await expect(client.get('/markets')).rejects.toBeInstanceOf(NetworkError);
  });
});
