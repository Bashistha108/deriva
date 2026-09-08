import type { MarketQuote, OptionQuote, PortfolioSnapshot, RiskMetrics, Trade } from "@/types/api";

export const WATCHLIST = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 582.41, change: 0.72, color: "spy" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 512.23, change: 0.41, color: "qqq" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 121.65, change: 2.89, color: "nvda" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.5, change: -0.92, color: "tsla" },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.32, change: 0.66, color: "aapl" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 418.76, change: 0.69, color: "msft" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.42, change: 1.21, color: "amzn" },
  { symbol: "META", name: "Meta Platforms", price: 567.31, change: 0.83, color: "meta" },
] as const;

export const INDICES = [
  { symbol: "SPX", name: "S&P 500 Index", price: 5487, change: 0.59 },
  { symbol: "VIX", name: "CBOE Volatility", price: 14.32, change: -4.53 },
] as const;

export const MOCK_UNDERLYINGS = ["SPY", "QQQ", "NVDA", "TSLA", "AAPL", "MSFT"];

export const MOCK_QUOTES: Record<string, MarketQuote> = Object.fromEntries(
  WATCHLIST.map((item) => [
    item.symbol,
    { symbol: item.symbol, bid: item.price - 0.05, ask: item.price + 0.05, lastPrice: item.price },
  ]),
);

export const MOCK_PORTFOLIO: PortfolioSnapshot = {
  accountId: "00000000-0000-0000-0000-000000000001",
  cashBalance: 21300,
  unrealizedPnl: 362,
  positions: [
    { symbol: "SPY", quantity: 2, averageCost: 8.4 },
    { symbol: "NVDA", quantity: 5, averageCost: 4.2 },
    { symbol: "QQQ", quantity: -2, averageCost: 6.1 },
  ],
};

export const MOCK_RISK: RiskMetrics = {
  accountId: "00000000-0000-0000-0000-000000000001",
  valueAtRisk: 15000,
  totalDelta: 124,
  totalGamma: 4.82,
  totalTheta: 86.2,
  totalVega: 214,
  marginUsage: 0.42,
};

export const MOCK_TRADES: Trade[] = [
  {
    executionId: "1052",
    orderId: "1052",
    symbol: "SPY",
    quantity: 1,
    price: 10.6,
    timestamp: new Date().toISOString(),
  },
];

const STRIKES = [560, 565, 570, 575, 580, 582.5, 585, 590, 595, 600, 605, 610, 615, 620];
const BASE_ROWS = [
  [22.45, 22.6, 17.8, 0.92, 0.0048],
  [19.82, 19.95, 17.9, 0.88, 0.0056],
  [17.3, 17.45, 18.1, 0.82, 0.0067],
  [14.95, 15.1, 18.4, 0.74, 0.0081],
  [12.7, 12.85, 18.8, 0.63, 0.0099],
  [10.6, 10.75, 19.2, 0.52, 0.0118],
  [8.65, 8.8, 19.7, 0.4, 0.0139],
  [6.9, 7.05, 20.3, 0.3, 0.0162],
  [5.4, 5.55, 21.0, 0.21, 0.0188],
  [4.15, 4.3, 21.8, 0.14, 0.0216],
  [3.1, 3.25, 22.7, 0.09, 0.0248],
  [2.25, 2.4, 23.8, 0.05, 0.0285],
  [1.6, 1.75, 25.1, 0.03, 0.0327],
  [1.1, 1.25, 26.4, 0.02, 0.0375],
];

const EXPIRIES = ["2026-09-20", "2026-09-27", "2026-10-04", "2026-10-18", "2026-11-15", "2026-12-20"];

export const MOCK_CHAIN: OptionQuote[] = EXPIRIES.flatMap((expirationDate) =>
  STRIKES.flatMap((strike, i) => {
    const row = BASE_ROWS[i];
    const call: OptionQuote = {
      optionSymbol: `SPY${expirationDate}${strike}C`,
      underlyingSymbol: "SPY",
      expirationDate,
      strikePrice: strike,
      optionType: "CALL",
      bid: row[0],
      ask: row[1],
      impliedVolatility: row[2] / 100,
      delta: row[3],
      gamma: row[4],
      theta: -0.08,
      vega: 0.12,
    };
    const put: OptionQuote = {
      ...call,
      optionSymbol: `SPY${expirationDate}${strike}P`,
      optionType: "PUT",
      bid: row[0] * 0.16,
      ask: row[1] * 0.16 + 0.1,
      delta: -(1 - row[3]),
    };
    return [call, put];
  }),
);

export const DEMO_ORDERS = {
  open: [
    { id: "#1058", symbol: "SPY", strategy: "Iron Condor", type: "LIMIT", qty: 2, expiration: "Sep 20", status: "WORKING" },
    { id: "#1057", symbol: "NVDA", strategy: "Bull Call Spread", type: "LIMIT", qty: 5, expiration: "Oct 18", status: "PARTIAL" },
    { id: "#1056", symbol: "QQQ", strategy: "Long Put", type: "LIMIT", qty: 2, expiration: "Sep 20", status: "WORKING" },
  ],
  filled: [
    { id: "#1052", symbol: "SPY", strategy: "Long Call", type: "MARKET", qty: 1, expiration: "Sep 20", status: "FILLED" },
    { id: "#1049", symbol: "NVDA", strategy: "Call Spread", type: "LIMIT", qty: 3, expiration: "Oct 18", status: "FILLED" },
  ],
  closed: [
    { id: "#1038", symbol: "SPY", strategy: "Iron Condor", type: "LIMIT", qty: 2, expiration: "Aug 30", status: "CLOSED" },
    { id: "#1029", symbol: "QQQ", strategy: "Put Spread", type: "LIMIT", qty: 2, expiration: "Aug 22", status: "CLOSED" },
    { id: "#1018", symbol: "AAPL", strategy: "Covered Call", type: "LIMIT", qty: 5, expiration: "Aug 12", status: "CLOSED" },
  ],
};

export const SPARK_PATHS: Record<string, string> = {
  SPY: "M2 26 L18 23 L32 25 L48 18 L64 21 L80 13 L98 16 L116 7 L148 10",
  QQQ: "M2 24 L22 21 L42 22 L60 15 L78 17 L98 10 L120 14 L148 6",
  NVDA: "M2 28 L20 25 L38 26 L56 18 L74 22 L90 10 L110 12 L128 6 L148 2",
  TSLA: "M2 8 L22 12 L42 9 L60 16 L80 12 L98 20 L120 18 L148 28",
};

export const SYMBOL_DOT: Record<string, string> = {
  spy: "bg-[#1e6b9e]",
  qqq: "bg-[#3a5a7a]",
  nvda: "bg-[#3a8a5a]",
  tsla: "bg-[#b53a4a]",
  aapl: "bg-[#5a6a7a]",
  msft: "bg-[#5a8a6a]",
  amzn: "bg-[#8a6a2a]",
  meta: "bg-[#3a6a9a]",
  idx: "bg-[#4a5a7a]",
};
