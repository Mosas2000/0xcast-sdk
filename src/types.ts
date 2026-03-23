/**
 * Network configuration
 */
export type NetworkType = 'mainnet' | 'testnet';

/**
 * Market status
 */
export type MarketStatus = 'active' | 'resolved' | 'cancelled' | 'pending';

/**
 * Market outcome
 */
export type Outcome = 'YES' | 'NO';

/**
 * Market category
 */
export type MarketCategory = 
  | 'crypto'
  | 'sports'
  | 'politics'
  | 'entertainment'
  | 'science'
  | 'other';

/**
 * SDK configuration options
 */
export interface OxCastConfig {
  /** Network to connect to */
  network: NetworkType;
  /** Optional API key for higher rate limits */
  apiKey?: string;
  /** Custom API endpoint */
  apiUrl?: string;
  /** Contract address override */
  contractAddress?: string;
}

/**
 * Market data structure
 */
export interface Market {
  /** Unique market identifier */
  id: string;
  /** Market question/title */
  title: string;
  /** Detailed description */
  description: string;
  /** Market category */
  category: MarketCategory;
  /** Current status */
  status: MarketStatus;
  /** Market creator address */
  creator: string;
  /** Total volume in microSTX */
  totalVolume: bigint;
  /** YES token price (0-100) */
  yesPrice: number;
  /** NO token price (0-100) */
  noPrice: number;
  /** Total YES shares */
  yesShares: bigint;
  /** Total NO shares */
  noShares: bigint;
  /** Market deadline timestamp */
  deadline: Date;
  /** Resolution source URL */
  resolutionSource?: string;
  /** Resolved outcome (if resolved) */
  resolvedOutcome?: Outcome;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * User position in a market
 */
export interface Position {
  /** Market ID */
  marketId: string;
  /** User address */
  userAddress: string;
  /** Outcome held */
  outcome: Outcome;
  /** Number of shares */
  shares: bigint;
  /** Average entry price */
  avgPrice: number;
  /** Total cost basis in microSTX */
  costBasis: bigint;
  /** Current value in microSTX */
  currentValue: bigint;
  /** Unrealized P&L in microSTX */
  unrealizedPnl: bigint;
}

/**
 * User portfolio summary
 */
export interface Portfolio {
  /** User address */
  address: string;
  /** All positions */
  positions: Position[];
  /** Total portfolio value in microSTX */
  totalValue: bigint;
  /** Total unrealized P&L */
  totalUnrealizedPnl: bigint;
  /** Total realized P&L */
  totalRealizedPnl: bigint;
  /** Number of active positions */
  activePositions: number;
}

/**
 * Order parameters for buying/selling
 */
export interface OrderParams {
  /** Market ID */
  marketId: string;
  /** Outcome to trade */
  outcome: Outcome;
  /** Amount in microSTX (for buy) or shares (for sell) */
  amount: bigint;
  /** Maximum slippage percentage (0-100) */
  maxSlippage?: number;
}

/**
 * Order result
 */
export interface OrderResult {
  /** Transaction ID */
  txId: string;
  /** Shares received/sold */
  shares: bigint;
  /** Price per share */
  price: number;
  /** Total cost/proceeds */
  total: bigint;
  /** Fees paid */
  fees: bigint;
}

/**
 * Market creation parameters
 */
export interface CreateMarketParams {
  /** Market title/question */
  title: string;
  /** Detailed description */
  description: string;
  /** Category */
  category: MarketCategory;
  /** Deadline for trading */
  deadline: Date;
  /** Resolution source URL */
  resolutionSource?: string;
  /** Initial liquidity in microSTX */
  initialLiquidity?: bigint;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Market filter options
 */
export interface MarketFilters extends PaginationOptions {
  /** Filter by status */
  status?: MarketStatus;
  /** Filter by category */
  category?: MarketCategory;
  /** Filter by creator */
  creator?: string;
  /** Search query */
  search?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Data items */
  data: T[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Has more pages */
  hasMore: boolean;
}

/**
 * API error
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}
