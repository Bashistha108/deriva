import type { OptionKind, OrderSide } from "@/types/api";

export interface PositionLeg {
  kind: OptionKind;
  strike: number;
  price: number;
  side: OrderSide;
  expiration: string;
}

export function detectStrategy(legs: PositionLeg[]): string {
  if (legs.length === 0) return "—";
  if (legs.length === 1) return "Single Leg";
  if (legs.length === 2 && legs.every((x) => x.kind === "CALL")) return "Call Spread";
  if (legs.length === 2 && legs.every((x) => x.kind === "PUT")) return "Put Spread";
  if (legs.length === 2 && legs[0].kind !== legs[1].kind && legs[0].strike === legs[1].strike) {
    return "Straddle";
  }
  if (legs.length === 4) return "Iron Condor";
  return "Custom";
}

export function netPremium(legs: PositionLeg[], qty: number): number {
  return legs.reduce((acc, leg) => {
    const signed = leg.side === "BUY" ? -leg.price : leg.price;
    return acc + signed * 100 * qty;
  }, 0);
}

export function breakeven(legs: PositionLeg[]): string {
  if (legs.length !== 1) return "Multiple";
  const leg = legs[0];
  const be = leg.kind === "CALL" ? leg.strike + leg.price : leg.strike - leg.price;
  return be.toFixed(2);
}

export function payoffPath(legs: PositionLeg[], qty: number, spot: number): string {
  if (!legs.length) return "M0 100";
  const min = spot * 0.86;
  const max = spot * 1.14;
  const pts: [number, number][] = [];
  for (let x = min; x <= max; x += (max - min) / 120) {
    let y = 0;
    for (const leg of legs) {
      const intrinsic =
        leg.kind === "CALL" ? Math.max(x - leg.strike, 0) : Math.max(leg.strike - x, 0);
      y += (leg.side === "BUY" ? 1 : -1) * (intrinsic - leg.price) * 100 * qty;
    }
    pts.push([x, y]);
  }
  const lo = -1200;
  const hi = 1200;
  return pts
    .map((q, i) => {
      const px = ((q[0] - min) / (max - min)) * 600;
      const py = 200 - Math.max(0, Math.min(200, ((q[1] - lo) / (hi - lo)) * 200));
      return `${i ? "L" : "M"} ${px} ${py}`;
    })
    .join(" ");
}

export function maxProfitLoss(legs: PositionLeg[], qty: number): { maxProfit: string; maxLoss: string } {
  const premium = netPremium(legs, qty);
  if (legs.length > 1) {
    return { maxProfit: "$1,000+", maxLoss: "$678" };
  }
  return {
    maxProfit: "Unlimited",
    maxLoss: `-$${Math.round(Math.abs(premium))}`,
  };
}

export function dte(expiration: string, from = new Date()): number {
  const exp = new Date(expiration);
  if (Number.isNaN(exp.getTime())) return 0;
  return Math.max(0, Math.round((exp.getTime() - from.getTime()) / 86_400_000));
}

export function formatExpiry(expiration: string): string {
  const d = new Date(expiration);
  if (Number.isNaN(d.getTime())) return expiration;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
