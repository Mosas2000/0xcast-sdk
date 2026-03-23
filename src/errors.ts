/**
 * SDK error codes
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_PARAMS: 'INVALID_PARAMS',
  MARKET_NOT_FOUND: 'MARKET_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  MARKET_CLOSED: 'MARKET_CLOSED',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Custom SDK error class
 */
export class OxCastError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'OxCastError';
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OxCastError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Network error (API unreachable, timeout, etc.)
 */
export class NetworkError extends OxCastError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCodes.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

/**
 * Invalid parameters error
 */
export class InvalidParamsError extends OxCastError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCodes.INVALID_PARAMS, message, details);
    this.name = 'InvalidParamsError';
  }
}

/**
 * Market not found error
 */
export class MarketNotFoundError extends OxCastError {
  constructor(marketId: string) {
    super(ErrorCodes.MARKET_NOT_FOUND, `Market not found: ${marketId}`, { marketId });
    this.name = 'MarketNotFoundError';
  }
}

/**
 * Insufficient balance error
 */
export class InsufficientBalanceError extends OxCastError {
  constructor(required: bigint, available: bigint) {
    super(
      ErrorCodes.INSUFFICIENT_BALANCE, 
      `Insufficient balance: required ${required}, available ${available}`,
      { required: required.toString(), available: available.toString() }
    );
    this.name = 'InsufficientBalanceError';
  }
}

/**
 * Market closed error
 */
export class MarketClosedError extends OxCastError {
  constructor(marketId: string) {
    super(ErrorCodes.MARKET_CLOSED, `Market is closed: ${marketId}`, { marketId });
    this.name = 'MarketClosedError';
  }
}

/**
 * Wallet not connected error
 */
export class WalletNotConnectedError extends OxCastError {
  constructor() {
    super(ErrorCodes.WALLET_NOT_CONNECTED, 'Wallet not connected. Please connect your wallet first.');
    this.name = 'WalletNotConnectedError';
  }
}
