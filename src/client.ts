import type { OxCastConfig, NetworkType } from './types';
import { MarketsApi } from './markets';
import { PortfolioApi } from './portfolio';
import { PositionsApi } from './positions';
import { DEFAULTS, getNetworkConfig } from './constants';

/**
 * Main 0xCast SDK client
 * 
 * @example
 * ```typescript
 * import { OxCast } from '@0xcast/sdk';
 * 
 * const client = new OxCast({ network: 'mainnet' });
 * 
 * // Fetch markets
 * const markets = await client.markets.list();
 * 
 * // Get user portfolio
 * const portfolio = await client.portfolio.get('SP...');
 * 
 * // Connect wallet for trading
 * client.connectWallet('SP...');
 * const quote = await client.positions.getBuyQuote({
 *   marketId: 'market-1',
 *   outcome: 'YES',
 *   amount: 1000000n, // 1 STX
 * });
 * ```
 */
export class OxCast {
  /** Markets API */
  public readonly markets: MarketsApi;
  
  /** Portfolio API */
  public readonly portfolio: PortfolioApi;
  
  /** Positions (Trading) API */
  public readonly positions: PositionsApi;

  /** Current network */
  public readonly network: NetworkType;

  /** Connected wallet address */
  private walletAddress?: string;

  /**
   * Create a new 0xCast SDK client
   */
  constructor(config: Partial<OxCastConfig> = {}) {
    this.network = config.network || DEFAULTS.network;
    
    const networkConfig = getNetworkConfig(this.network);
    const apiUrl = config.apiUrl || networkConfig.apiUrl;

    this.markets = new MarketsApi(this.network, config.apiKey, apiUrl);
    this.portfolio = new PortfolioApi(this.network, config.apiKey, apiUrl);
    this.positions = new PositionsApi(this.network, config.apiKey, apiUrl);
  }

  /**
   * Connect a wallet address
   * Required for trading operations
   */
  connectWallet(address: string): void {
    this.walletAddress = address;
    this.positions.setWallet(address);
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.walletAddress = undefined;
    this.positions.clearWallet();
  }

  /**
   * Get connected wallet address
   */
  getWalletAddress(): string | undefined {
    return this.walletAddress;
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return !!this.walletAddress;
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    return getNetworkConfig(this.network);
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return getNetworkConfig(this.network).contractAddress;
  }

  /**
   * Get explorer URL for a transaction
   */
  getExplorerUrl(txId: string): string {
    const config = getNetworkConfig(this.network);
    return `${config.explorerUrl}/txid/${txId}`;
  }

  /**
   * Get explorer URL for an address
   */
  getAddressExplorerUrl(address: string): string {
    const config = getNetworkConfig(this.network);
    return `${config.explorerUrl}/address/${address}`;
  }
}
