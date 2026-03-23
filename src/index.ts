// Main client
export { OxCast } from './client';

// API modules
export { MarketsApi } from './markets';
export { PortfolioApi } from './portfolio';
export { PositionsApi } from './positions';

// Types
export type {
  OxCastConfig,
  NetworkType,
  MarketStatus,
  Outcome,
  MarketCategory,
  Market,
  Position,
  Portfolio,
  OrderParams,
  OrderResult,
  CreateMarketParams,
  PaginationOptions,
  MarketFilters,
  PaginatedResponse,
  ApiError,
} from './types';

// Errors
export {
  OxCastError,
  NetworkError,
  InvalidParamsError,
  MarketNotFoundError,
  InsufficientBalanceError,
  MarketClosedError,
  WalletNotConnectedError,
  ErrorCodes,
} from './errors';

// Constants
export {
  NETWORKS,
  CONTRACTS,
  DEFAULTS,
  STX,
  getNetworkConfig,
} from './constants';

// Utilities
export { HttpClient } from './http';
