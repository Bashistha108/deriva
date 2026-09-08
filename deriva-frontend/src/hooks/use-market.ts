"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { DEFAULT_ACCOUNT_ID, useAuthStore } from "@/store/auth-store";

export function useAccountId() {
  return useAuthStore((s) => s.accountId) ?? DEFAULT_ACCOUNT_ID;
}

export function usePortfolioQuery() {
  const accountId = useAccountId();
  return useQuery({
    queryKey: ["portfolio", accountId],
    queryFn: () => api.portfolio(accountId),
  });
}

export function useRiskQuery() {
  const accountId = useAccountId();
  return useQuery({
    queryKey: ["risk", accountId],
    queryFn: () => api.risk(accountId),
  });
}

export function useTradesQuery() {
  const accountId = useAccountId();
  return useQuery({
    queryKey: ["trades", accountId],
    queryFn: () => api.trades(accountId),
  });
}

export function useQuoteQuery(symbol: string) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => api.quote(symbol),
    refetchInterval: 5000,
  });
}

export function useOptionChainQuery(symbol: string) {
  return useQuery({
    queryKey: ["chain", symbol],
    queryFn: () => api.optionChain(symbol),
  });
}

export function useUnderlyingsQuery() {
  return useQuery({
    queryKey: ["underlyings"],
    queryFn: () => api.underlyings(),
  });
}
