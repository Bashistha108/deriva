import { create } from "zustand";
import type { PositionLeg } from "@/lib/trading/strategy";
import type { OptionKind, OrderSide } from "@/types/api";

interface ChainState {
  symbol: string;
  name: string;
  lastPrice: number;
  changePct: number;
  expiry: string | null;
  qty: number;
  legs: PositionLeg[];
  setSymbol: (symbol: string, name: string, lastPrice: number, changePct: number) => void;
  setQuote: (lastPrice: number, changePct?: number) => void;
  setExpiry: (expiry: string) => void;
  setQty: (qty: number) => void;
  addLeg: (leg: { kind: OptionKind; strike: number; price: number; side: OrderSide; expiration: string }) => void;
  removeLeg: (index: number) => void;
  clear: () => void;
}

export const useChainStore = create<ChainState>((set) => ({
  symbol: "SPY",
  name: "SPDR S&P 500 ETF",
  lastPrice: 582.41,
  changePct: 0.72,
  expiry: null,
  qty: 1,
  legs: [],
  setSymbol: (symbol, name, lastPrice, changePct) =>
    set({ symbol, name, lastPrice, changePct, legs: [] }),
  setQuote: (lastPrice, changePct) =>
    set((state) => ({ lastPrice, changePct: changePct ?? state.changePct })),
  setExpiry: (expiry) => set({ expiry }),
  setQty: (qty) => set({ qty: Math.max(1, qty) }),
  addLeg: (leg) =>
    set((state) => {
      const key = (x: PositionLeg) => `${x.kind}-${x.strike}-${x.expiration}`;
      const existing = state.legs.find((x) => key(x) === key(leg));
      if (existing) {
        return {
          legs: state.legs.map((x) =>
            key(x) === key(leg) ? { ...x, side: x.side === "BUY" ? "SELL" : "BUY", price: leg.price } : x,
          ),
        };
      }
      return { legs: [...state.legs, { ...leg, side: leg.side }] };
    }),
  removeLeg: (index) => set((state) => ({ legs: state.legs.filter((_, i) => i !== index) })),
  clear: () => set({ legs: [], qty: 1 }),
}));
