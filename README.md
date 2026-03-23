# @0xcast/sdk

Official SDK for 0xCast - Decentralized Prediction Markets on Bitcoin.

## Installation

```bash
npm install @0xcast/sdk
```

## Quick Start

```typescript
import { OxCast } from '@0xcast/sdk';

// Initialize client
const client = new OxCast({
  network: 'mainnet', // or 'testnet'
});

// Fetch all markets
const markets = await client.markets.list();

// Get specific market
const market = await client.markets.get('market-id');

// Get user portfolio
const portfolio = await client.portfolio.get('SP...');
```

## Features

- **Read Markets**: Fetch active, resolved, and trending markets
- **Portfolio Management**: Track user positions and P&L
- **Position Trading**: Buy and sell market positions (requires wallet)
- **Real-time Updates**: Subscribe to market price changes

## Documentation

Full documentation: [https://docs.0xcast.com](https://docs.0xcast.com)

## Requirements

- Node.js >= 18
- For wallet operations: `@stacks/connect` >= 8.0.0

## License

MIT
