export type OrderSide = "BUY" | "SELL";
export type OptionKind = "CALL" | "PUT";
export type OrderType = "MARKET" | "LIMIT";
export type OrderStatus =
  | "WORKING"
  | "PARTIAL"
  | "FILLED"
  | "CANCELLED"
  | "CLOSED"
  | "REJECTED"
  | "PENDING";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PortfolioSnapshot {
  accountId: string;
  cashBalance: number;
  positions: Position[];
  unrealizedPnl: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
}

export interface MarketQuote {
  symbol: string;
  bid: number;
  ask: number;
  lastPrice: number;
  timestamp?: string;
}

export interface OptionQuote {
  optionSymbol: string;
  underlyingSymbol: string;
  expirationDate: string;
  strikePrice: number;
  optionType: OptionKind;
  bid: number;
  ask: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  timestamp?: string;
}

export interface RiskMetrics {
  accountId: string;
  valueAtRisk: number;
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
  marginUsage: number;
}

export interface Trade {
  executionId: string;
  orderId: string | null;
  symbol: string;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface OrderLegRequest {
  symbol: string;
  side: OrderSide;
  quantity: number;
}

export interface OrderRequest {
  accountId: string;
  idempotencyKey: string;
  type: OrderType;
  legs: OrderLegRequest[];
}

export interface OrderResponse {
  orderId: string;
  accountId: string;
  status: OrderStatus | string;
  type: OrderType | string;
  legs: OrderLegRequest[];
}
