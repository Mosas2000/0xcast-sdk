import type { 
  OrderParams, 
  NetworkType 
} from './types';
import { HttpClient } from './http';
import { CONTRACTS, STX, DEFAULTS, getNetworkConfig } from './constants';
import { 
  InvalidParamsError, 
  WalletNotConnectedError
} from './errors';

/**
 * Positions (Trading) API client
 * 
 * Note: Trading operations require a connected wallet.
 * The SDK provides transaction building helpers, but actual
 * signing and broadcasting should be done via @stacks/connect.
 */
export class PositionsApi {
  private readonly http: HttpClient;
  private readonly contractAddress: string;
  private walletAddress?: string;

  constructor(network: NetworkType, apiKey?: string, customUrl?: string) {
    this.http = new HttpClient(network, apiKey, customUrl);
    this.contractAddress = getNetworkConfig(network).contractAddress;
  }

  /**
   * Set the connected wallet address
   */
  setWallet(address: string): void {
    this.walletAddress = address;
  }

  /**
   * Clear wallet connection
   */
  clearWallet(): void {
    this.walletAddress = undefined;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.walletAddress;
  }

  /**
   * Get quote for buying shares
   */
  async getBuyQuote(params: OrderParams): Promise<{
    shares: bigint;
    pricePerShare: number;
    totalCost: bigint;
    fees: bigint;
    priceImpact: number;
  }> {
    this.validateOrderParams(params);

    const response = await this.http.post<{
      shares: string;
      price_per_share: number;
      total_cost: string;
      fees: string;
      price_impact: number;
    }>(`/v1/markets/${params.marketId}/quote/buy`, {
      outcome: params.outcome,
      amount: params.amount.toString(),
    });

    return {
      shares: BigInt(response.shares),
      pricePerShare: response.price_per_share,
      totalCost: BigInt(response.total_cost),
      fees: BigInt(response.fees),
      priceImpact: response.price_impact,
    };
  }

  /**
   * Get quote for selling shares
   */
  async getSellQuote(params: OrderParams): Promise<{
    proceeds: bigint;
    pricePerShare: number;
    fees: bigint;
    priceImpact: number;
  }> {
    this.validateOrderParams(params);

    const response = await this.http.post<{
      proceeds: string;
      price_per_share: number;
      fees: string;
      price_impact: number;
    }>(`/v1/markets/${params.marketId}/quote/sell`, {
      outcome: params.outcome,
      shares: params.amount.toString(),
    });

    return {
      proceeds: BigInt(response.proceeds),
      pricePerShare: response.price_per_share,
      fees: BigInt(response.fees),
      priceImpact: response.price_impact,
    };
  }

  /**
   * Build buy transaction (returns contract call parameters)
   * 
   * Use this with @stacks/connect to execute the transaction:
   * ```
   * const txParams = await positions.buildBuyTransaction(params);
   * await openContractCall(txParams);
   * ```
   */
  async buildBuyTransaction(params: OrderParams): Promise<{
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: string[];
    postConditions: unknown[];
  }> {
    this.ensureWalletConnected();
    this.validateOrderParams(params);

    const quote = await this.getBuyQuote(params);
    const maxSlippage = params.maxSlippage ?? DEFAULTS.slippage;
    const maxCost = quote.totalCost + (quote.totalCost * BigInt(maxSlippage)) / 100n;

    return {
      contractAddress: this.contractAddress,
      contractName: CONTRACTS.MARKET_TRADING,
      functionName: 'buy-shares',
      functionArgs: [
        params.marketId,
        params.outcome === 'YES' ? 'true' : 'false',
        params.amount.toString(),
        maxCost.toString(),
      ],
      postConditions: [],
    };
  }

  /**
   * Build sell transaction (returns contract call parameters)
   */
  async buildSellTransaction(params: OrderParams): Promise<{
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: string[];
    postConditions: unknown[];
  }> {
    this.ensureWalletConnected();
    this.validateOrderParams(params);

    const quote = await this.getSellQuote(params);
    const maxSlippage = params.maxSlippage ?? DEFAULTS.slippage;
    const minProceeds = quote.proceeds - (quote.proceeds * BigInt(maxSlippage)) / 100n;

    return {
      contractAddress: this.contractAddress,
      contractName: CONTRACTS.MARKET_TRADING,
      functionName: 'sell-shares',
      functionArgs: [
        params.marketId,
        params.outcome === 'YES' ? 'true' : 'false',
        params.amount.toString(),
        minProceeds.toString(),
      ],
      postConditions: [],
    };
  }

  /**
   * Validate order parameters
   */
  private validateOrderParams(params: OrderParams): void {
    if (!params.marketId) {
      throw new InvalidParamsError('Market ID is required');
    }

    if (!params.outcome || !['YES', 'NO'].includes(params.outcome)) {
      throw new InvalidParamsError('Outcome must be YES or NO');
    }

    if (!params.amount || params.amount <= 0n) {
      throw new InvalidParamsError('Amount must be greater than 0');
    }

    if (params.amount < STX.MIN_TRADE) {
      throw new InvalidParamsError(
        `Minimum trade amount is ${Number(STX.MIN_TRADE) / 1_000_000} STX`
      );
    }
  }

  /**
   * Ensure wallet is connected
   */
  private ensureWalletConnected(): void {
    if (!this.walletAddress) {
      throw new WalletNotConnectedError();
    }
  }
}
