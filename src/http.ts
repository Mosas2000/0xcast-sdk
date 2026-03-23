import type { NetworkType, ApiError } from './types';
import { NETWORKS, DEFAULTS } from './constants';
import { NetworkError, OxCastError, ErrorCodes } from './errors';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * HTTP client for API requests
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;

  constructor(network: NetworkType, apiKey?: string, customUrl?: string) {
    this.baseUrl = customUrl || NETWORKS[network].apiUrl;
    this.apiKey = apiKey;
    this.timeout = DEFAULTS.timeout;
  }

  /**
   * Make an HTTP request
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof OxCastError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout', { timeout: this.timeout });
        }
        throw new NetworkError(error.message);
      }
      
      throw new NetworkError('Unknown network error');
    }
  }

  /**
   * Handle error response from API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiError | null = null;
    
    try {
      errorData = await response.json() as ApiError;
    } catch {
      // Response body is not JSON
    }

    const message = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
    
    switch (response.status) {
      case 401:
        throw new OxCastError(ErrorCodes.UNAUTHORIZED, message);
      case 429:
        throw new OxCastError(ErrorCodes.RATE_LIMITED, message);
      case 404:
        throw new OxCastError(ErrorCodes.MARKET_NOT_FOUND, message);
      default:
        throw new NetworkError(message, { status: response.status });
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }
}
