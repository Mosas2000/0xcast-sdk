import type { 
  Market, 
  MarketFilters, 
  PaginatedResponse,
  NetworkType 
} from './types';
import { HttpClient } from './http';
import { DEFAULTS, CONTRACTS, getNetworkConfig } from './constants';
import { MarketNotFoundError, InvalidParamsError } from './errors';

/**
 * Raw market data from API/contract
 */
interface RawMarketData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  creator: string;
  total_volume: string;
  yes_price: number;
  no_price: number;
  yes_shares: string;
  no_shares: string;
  deadline: number;
  resolution_source?: string;
  resolved_outcome?: string;
  created_at: number;
  updated_at: number;
}

/**
 * Markets API client
 */
export class MarketsApi {
  private readonly http: HttpClient;
  private readonly contractAddress: string;

  constructor(network: NetworkType, apiKey?: string, customUrl?: string) {
    this.http = new HttpClient(network, apiKey, customUrl);
    this.contractAddress = getNetworkConfig(network).contractAddress;
  }

  /**
   * List markets with optional filters
   */
  async list(filters?: MarketFilters): Promise<PaginatedResponse<Market>> {
    const params: Record<string, string | number | boolean> = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || DEFAULTS.pageLimit, DEFAULTS.maxPageLimit),
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.category) params.category = filters.category;
    if (filters?.creator) params.creator = filters.creator;
    if (filters?.search) params.search = filters.search;
    if (filters?.sortBy) params.sort_by = filters.sortBy;
    if (filters?.sortOrder) params.sort_order = filters.sortOrder;

    const response = await this.http.get<{
      data: RawMarketData[];
      total: number;
      page: number;
      limit: number;
    }>(`/extended/v1/contract/${this.contractAddress}.${CONTRACTS.MARKET_CORE}/markets`, params);

    return {
      data: response.data.map(this.parseMarket),
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasMore: response.page * response.limit < response.total,
    };
  }

  /**
   * Get a single market by ID
   */
  async get(marketId: string): Promise<Market> {
    if (!marketId) {
      throw new InvalidParamsError('Market ID is required');
    }

    try {
      const raw = await this.http.get<RawMarketData>(
        `/extended/v1/contract/${this.contractAddress}.${CONTRACTS.MARKET_CORE}/markets/${marketId}`
      );
      return this.parseMarket(raw);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new MarketNotFoundError(marketId);
      }
      throw error;
    }
  }

  /**
   * Get active markets
   */
  async getActive(options?: Omit<MarketFilters, 'status'>): Promise<PaginatedResponse<Market>> {
    return this.list({ ...options, status: 'active' });
  }

  /**
   * Get resolved markets
   */
  async getResolved(options?: Omit<MarketFilters, 'status'>): Promise<PaginatedResponse<Market>> {
    return this.list({ ...options, status: 'resolved' });
  }

  /**
   * Get trending markets (highest volume)
   */
  async getTrending(limit = 10): Promise<Market[]> {
    const response = await this.list({
      status: 'active',
      sortBy: 'volume',
      sortOrder: 'desc',
      limit,
    });
    return response.data;
  }

  /**
   * Get markets by category
   */
  async getByCategory(
    category: Market['category'],
    options?: Omit<MarketFilters, 'category'>
  ): Promise<PaginatedResponse<Market>> {
    return this.list({ ...options, category });
  }

  /**
   * Search markets
   */
  async search(query: string, options?: Omit<MarketFilters, 'search'>): Promise<PaginatedResponse<Market>> {
    if (!query || query.trim().length === 0) {
      throw new InvalidParamsError('Search query is required');
    }
    return this.list({ ...options, search: query.trim() });
  }

  /**
   * Parse raw market data into Market interface
   */
  private parseMarket(raw: RawMarketData): Market {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category as Market['category'],
      status: raw.status as Market['status'],
      creator: raw.creator,
      totalVolume: BigInt(raw.total_volume),
      yesPrice: raw.yes_price,
      noPrice: raw.no_price,
      yesShares: BigInt(raw.yes_shares),
      noShares: BigInt(raw.no_shares),
      deadline: new Date(raw.deadline * 1000),
      resolutionSource: raw.resolution_source,
      resolvedOutcome: raw.resolved_outcome as Market['resolvedOutcome'],
      createdAt: new Date(raw.created_at * 1000),
      updatedAt: new Date(raw.updated_at * 1000),
    };
  }
}
