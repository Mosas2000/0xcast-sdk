import type { 
  Position, 
  Portfolio,
  NetworkType,
  Outcome
} from './types';
import { HttpClient } from './http';
import { InvalidParamsError } from './errors';

/**
 * Raw position data from API
 */
interface RawPositionData {
  market_id: string;
  user_address: string;
  outcome: string;
  shares: string;
  avg_price: number;
  cost_basis: string;
  current_value: string;
  unrealized_pnl: string;
}

/**
 * Raw portfolio data from API
 */
interface RawPortfolioData {
  address: string;
  positions: RawPositionData[];
  total_value: string;
  total_unrealized_pnl: string;
  total_realized_pnl: string;
  active_positions: number;
}

/**
 * Portfolio API client
 */
export class PortfolioApi {
  private readonly http: HttpClient;

  constructor(network: NetworkType, apiKey?: string, customUrl?: string) {
    this.http = new HttpClient(network, apiKey, customUrl);
  }

  /**
   * Get user portfolio
   */
  async get(address: string): Promise<Portfolio> {
    this.validateAddress(address);

    const raw = await this.http.get<RawPortfolioData>(
      `/extended/v1/address/${address}/portfolio`
    );

    return this.parsePortfolio(raw);
  }

  /**
   * Get user positions for a specific market
   */
  async getMarketPositions(address: string, marketId: string): Promise<Position[]> {
    this.validateAddress(address);

    if (!marketId) {
      throw new InvalidParamsError('Market ID is required');
    }

    const raw = await this.http.get<RawPositionData[]>(
      `/extended/v1/address/${address}/markets/${marketId}/positions`
    );

    return raw.map(this.parsePosition);
  }

  /**
   * Get all positions for a user
   */
  async getAllPositions(address: string): Promise<Position[]> {
    const portfolio = await this.get(address);
    return portfolio.positions;
  }

  /**
   * Get user's active positions (in active markets)
   */
  async getActivePositions(address: string): Promise<Position[]> {
    this.validateAddress(address);

    const raw = await this.http.get<RawPositionData[]>(
      `/extended/v1/address/${address}/positions/active`
    );

    return raw.map(this.parsePosition);
  }

  /**
   * Get user's P&L summary
   */
  async getPnlSummary(address: string): Promise<{
    totalRealized: bigint;
    totalUnrealized: bigint;
    totalValue: bigint;
  }> {
    const portfolio = await this.get(address);
    
    return {
      totalRealized: portfolio.totalRealizedPnl,
      totalUnrealized: portfolio.totalUnrealizedPnl,
      totalValue: portfolio.totalValue,
    };
  }

  /**
   * Validate Stacks address format
   */
  private validateAddress(address: string): void {
    if (!address) {
      throw new InvalidParamsError('Address is required');
    }

    // Stacks addresses start with SP (mainnet) or ST (testnet)
    if (!address.match(/^(SP|ST)[A-Z0-9]{38,40}$/)) {
      throw new InvalidParamsError(`Invalid Stacks address: ${address}`);
    }
  }

  /**
   * Parse raw position data
   */
  private parsePosition(raw: RawPositionData): Position {
    return {
      marketId: raw.market_id,
      userAddress: raw.user_address,
      outcome: raw.outcome as Outcome,
      shares: BigInt(raw.shares),
      avgPrice: raw.avg_price,
      costBasis: BigInt(raw.cost_basis),
      currentValue: BigInt(raw.current_value),
      unrealizedPnl: BigInt(raw.unrealized_pnl),
    };
  }

  /**
   * Parse raw portfolio data
   */
  private parsePortfolio(raw: RawPortfolioData): Portfolio {
    return {
      address: raw.address,
      positions: raw.positions.map(this.parsePosition),
      totalValue: BigInt(raw.total_value),
      totalUnrealizedPnl: BigInt(raw.total_unrealized_pnl),
      totalRealizedPnl: BigInt(raw.total_realized_pnl),
      activePositions: raw.active_positions,
    };
  }
}
