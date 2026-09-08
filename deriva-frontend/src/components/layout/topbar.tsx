"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { etTime, pct } from "@/lib/format";
import { useQuoteQuery } from "@/hooks/use-market";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const [clock, setClock] = useState("");
  const { data: spy } = useQuoteQuery("SPY");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const tick = () => setClock(`${etTime()} ET`);
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const spyLast = spy?.lastPrice ?? 582.41;
  const spyChg = ((spyLast - 578.24) / 578.24) * 100;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3.5">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--muted-text)]" />
        <input
          type="search"
          placeholder="Search symbol or strategy…"
          className="h-[38px] w-full rounded-lg border border-[var(--line)] bg-[var(--bg2)] pr-3.5 pl-9 text-xs text-[var(--text2)] placeholder:text-[var(--muted-text)] transition focus:border-[var(--blue)] focus:ring-3 focus:ring-[rgba(58,173,255,.12)] focus:outline-none"
        />
      </div>
      <QuotePill symbol="SPY" price={spyLast} change={spyChg} live />
      <QuotePill symbol="VIX" price={14.32} change={-4.53} />
      <div className="px-1 text-[10px] text-[var(--muted-text)]">{clock}</div>
      {isAuthenticated ? (
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-[var(--line)] bg-[var(--bg2)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text2)] hover:text-white"
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-[var(--blue)] bg-[var(--blue-dim)] px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

function QuotePill({
  symbol,
  price,
  change,
  live,
}: {
  symbol: string;
  price: number;
  change: number;
  live?: boolean;
}) {
  const pos = change >= 0;
  return (
    <div className="flex items-baseline gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg2)] px-3.5 py-1.5 text-[11px] whitespace-nowrap text-[var(--text2)]">
      {live ? (
        <span className="mr-0.5 inline-block size-[5px] rounded-full bg-[var(--green)] animate-pulse-dot" />
      ) : null}
      {symbol} <b className="font-bold text-white">{price.toFixed(2)}</b>
      <span className={`text-[10px] font-semibold ${pos ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
        {pct(change)}
      </span>
    </div>
  );
}
