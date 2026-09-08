import { fetchApi, fetchApiSafe } from "@/lib/api/client";
import { MOCK_CHAIN, MOCK_PORTFOLIO, MOCK_QUOTES, MOCK_RISK, MOCK_TRADES, MOCK_UNDERLYINGS } from "@/lib/data/mocks";
import type {
  MarketQuote,
  OptionQuote,
  OrderRequest,
  OrderResponse,
  PortfolioSnapshot,
  RiskMetrics,
  TokenResponse,
  Trade,
} from "@/types/api";

function normalizeQuote(raw: Record<string, unknown>): MarketQuote {
  return {
    symbol: String(raw.symbol),
    bid: Number(raw.bid ?? 0),
    ask: Number(raw.ask ?? 0),
    lastPrice: Number(raw.lastPrice ?? raw.last ?? 0),
    timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
  };
}

function normalizeOption(raw: Record<string, unknown>): OptionQuote {
  return {
    optionSymbol: String(raw.optionSymbol ?? ""),
    underlyingSymbol: String(raw.underlyingSymbol ?? ""),
    expirationDate: String(raw.expirationDate ?? ""),
    strikePrice: Number(raw.strikePrice ?? 0),
    optionType: String(raw.optionType ?? "CALL").toUpperCase() === "PUT" ? "PUT" : "CALL",
    bid: Number(raw.bid ?? 0),
    ask: Number(raw.ask ?? 0),
    impliedVolatility: Number(raw.impliedVolatility ?? 0),
    delta: Number(raw.delta ?? 0),
    gamma: Number(raw.gamma ?? 0),
    theta: Number(raw.theta ?? 0),
    vega: Number(raw.vega ?? 0),
    timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
  };
}

export const api = {
  login(username: string, password: string) {
    return fetchApi<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  portfolio(accountId: string) {
    return fetchApiSafe<Record<string, unknown>>(`/portfolio/${accountId}`, MOCK_PORTFOLIO as unknown as Record<string, unknown>).then(
      (raw) => {
        const positions = Array.isArray(raw.positions) ? raw.positions : [];
        return {
          accountId: String(raw.accountId),
          cashBalance: Number(raw.cashBalance ?? 0),
          unrealizedPnl: Number(raw.unrealizedPnl ?? 0),
          positions: positions.map((p) => {
            const row = p as Record<string, unknown>;
            return {
              symbol: String(row.symbol),
              quantity: Number(row.quantity ?? 0),
              averageCost: Number(row.averageCost ?? row.averageEntryPrice ?? 0),
            };
          }),
        };
      },
    );
  },

  risk(accountId: string) {
    return fetchApiSafe<RiskMetrics>(`/risk/${accountId}`, MOCK_RISK).then((raw) => ({
      accountId: String(raw.accountId),
      valueAtRisk: Number(raw.valueAtRisk ?? 0),
      totalDelta: Number(raw.totalDelta ?? 0),
      totalGamma: Number(raw.totalGamma ?? 0),
      totalTheta: Number(raw.totalTheta ?? 0),
      totalVega: Number(raw.totalVega ?? 0),
      marginUsage: Number(raw.marginUsage ?? 0),
    }));
  },

  trades(accountId: string) {
    return fetchApiSafe<Trade[]>(`/trades/${accountId}`, MOCK_TRADES).then((rows) =>
      rows.map((row) => ({
        executionId: String(row.executionId),
        orderId: row.orderId ? String(row.orderId) : null,
        symbol: String(row.symbol),
        quantity: Number(row.quantity ?? 0),
        price: Number(row.price ?? 0),
        timestamp: String(row.timestamp),
      })),
    );
  },

  quote(symbol: string) {
    const fallback = MOCK_QUOTES[symbol] ?? MOCK_QUOTES.SPY;
    return fetchApiSafe<Record<string, unknown>>(`/market-data/quotes/${symbol}`, fallback as unknown as Record<string, unknown>).then(
      normalizeQuote,
    );
  },

  underlyings() {
    return fetchApiSafe<string[]>("/underlyings", MOCK_UNDERLYINGS);
  },

  optionChain(symbol: string) {
    return fetchApiSafe<Record<string, unknown>[]>(`/options/${symbol}/chain`, MOCK_CHAIN as unknown as Record<string, unknown>[]).then(
      (rows) => (rows.length ? rows.map(normalizeOption) : MOCK_CHAIN),
    );
  },

  submitOrder(request: OrderRequest) {
    return fetchApi<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  cancelOrder(orderId: string) {
    return fetchApi<OrderResponse>(`/orders/${orderId}`, { method: "DELETE" });
  },
};
