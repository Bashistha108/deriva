"use client";

import { useEffect, useMemo, useState } from "react";
import { INDICES, SYMBOL_DOT, WATCHLIST } from "@/lib/data/mocks";
import { cnPos, pct } from "@/lib/format";
import { useOptionChainQuery, useQuoteQuery } from "@/hooks/use-market";
import { useChainStore } from "@/store/chain-store";
import { dte, formatExpiry } from "@/lib/trading/strategy";
import { GhostButton, PageHeader } from "@/components/layout/page-header";
import { ChainTable } from "@/components/chain/chain-table";
import { PositionPanel } from "@/components/chain/position-panel";
import type { OptionQuote } from "@/types/api";

export function ChainView() {
  const symbol = useChainStore((s) => s.symbol);
  const name = useChainStore((s) => s.name);
  const lastPrice = useChainStore((s) => s.lastPrice);
  const changePct = useChainStore((s) => s.changePct);
  const expiry = useChainStore((s) => s.expiry);
  const setSymbol = useChainStore((s) => s.setSymbol);
  const setQuote = useChainStore((s) => s.setQuote);
  const setExpiry = useChainStore((s) => s.setExpiry);
  const [filter, setFilter] = useState("");
  const [sideView, setSideView] = useState<"both" | "calls" | "puts">("both");

  const { data: chain = [] } = useOptionChainQuery(symbol);
  const { data: quote } = useQuoteQuery(symbol);

  const spot = quote?.lastPrice ?? lastPrice;

  useEffect(() => {
    if (quote?.lastPrice && Math.abs(quote.lastPrice - lastPrice) > 0.001) {
      setQuote(quote.lastPrice);
    }
  }, [quote?.lastPrice, lastPrice, setQuote]);

  const expiries = useMemo(() => {
    const set = new Set(chain.map((q) => q.expirationDate));
    return [...set].sort();
  }, [chain]);

  const activeExpiry = expiry && expiries.includes(expiry) ? expiry : expiries[0] ?? "";

  const rows = useMemo(() => {
    const forExpiry = chain.filter((q) => q.expirationDate === activeExpiry);
    const byStrike = new Map<number, { call?: OptionQuote; put?: OptionQuote }>();
    for (const q of forExpiry) {
      const bucket = byStrike.get(q.strikePrice) ?? {};
      if (q.optionType === "PUT") bucket.put = q;
      else bucket.call = q;
      byStrike.set(q.strikePrice, bucket);
    }
    return [...byStrike.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([strike, legs]) => ({ strike, call: legs.call, put: legs.put }));
  }, [chain, activeExpiry]);

  const filteredWatch = WATCHLIST.filter(
    (s) =>
      s.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      s.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <>
      <PageHeader title="Options Chain" subtitle="Select an underlying, expiry, then click bid/ask to build a position">
        <GhostButton>Columns ▾</GhostButton>
        <GhostButton>⚙</GhostButton>
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[220px_1fr_340px]">
        <aside className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg2)]">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <div>
              <b className="text-[13px]">Watchlist</b>
              <div className="text-[9px] text-[var(--muted-text)]">Select symbol</div>
            </div>
            <button type="button" className="rounded-lg border border-[var(--line)] px-2.5 text-base text-[var(--text2)]">
              ＋
            </button>
          </div>
          <div className="mx-3 mb-2.5 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-[10px] text-[var(--muted-text)]">
            ⌕
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter symbols"
              className="w-full bg-transparent text-[10px] text-[var(--text2)] outline-none"
            />
          </div>
          <div>
            {filteredWatch.map((item) => {
              const active = item.symbol === symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => {
                    setSymbol(item.symbol, item.name, item.price, item.change);
                    setExpiry(expiries[0] ?? "");
                  }}
                  className={`grid w-full grid-cols-[28px_1fr_auto] items-center gap-2 border-l-2 px-3.5 py-2 text-left ${
                    active ? "border-l-[var(--blue)] bg-[var(--panel)]" : "border-l-transparent hover:bg-[var(--panel)]"
                  }`}
                >
                  <span
                    className={`grid size-[26px] place-items-center rounded-full text-[9px] font-black text-white ${SYMBOL_DOT[item.color]}`}
                  >
                    {item.symbol[0]}
                  </span>
                  <div>
                    <b className="block text-[11px]">{item.symbol}</b>
                    <small className="mt-0.5 block max-w-[100px] truncate text-[8px] text-[var(--muted-text)]">
                      {item.name}
                    </small>
                  </div>
                  <div className="text-right text-[10px] font-semibold leading-tight">
                    {item.price.toFixed(2)}
                    <div className={`text-[8px] font-medium ${cnPos(item.change)}`}>{pct(item.change)}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 border-y border-[var(--line)] px-3.5 py-1.5 text-[8px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">
            Indices
          </div>
          {INDICES.map((item) => (
            <div key={item.symbol} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 px-3.5 py-2">
              <span className={`grid size-[26px] place-items-center rounded-full text-[9px] font-black text-white ${SYMBOL_DOT.idx}`}>
                {item.symbol[0]}
              </span>
              <div>
                <b className="block text-[11px]">{item.symbol}</b>
                <small className="text-[8px] text-[var(--muted-text)]">{item.name}</small>
              </div>
              <div className="text-right text-[10px] font-semibold">
                {item.price.toLocaleString()}
                <div className={`text-[8px] ${cnPos(item.change)}`}>{pct(item.change)}</div>
              </div>
            </div>
          ))}
        </aside>

        <div>
          <div className="grid grid-cols-1 items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg2)] px-4 py-3.5 lg:grid-cols-[1fr_1.2fr_120px]">
            <div>
              <div className="text-xl font-extrabold tracking-tight">
                {symbol} <small className="ml-2 text-[11px] font-normal text-[var(--muted-text)]">{name}</small>
              </div>
              <div className="mt-0.5 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold">{spot.toFixed(2)}</span>
                <span className={`text-xs font-semibold ${cnPos(changePct)}`}>
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}% (today)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-around gap-3 border-[var(--line)] text-[9px] text-[var(--muted-text)] lg:border-x lg:px-4">
              <Stat label="High" value={(spot * 1.002).toFixed(2)} />
              <Stat label="Low" value={(spot * 0.994).toFixed(2)} />
              <Stat label="Open" value={(spot * 0.995).toFixed(2)} />
              <Stat label="Vol" value="42.8M" />
              <Stat label="IV" value="18.24%" />
              <Stat label="HV" value="12.63%" />
            </div>
            <svg viewBox="0 0 170 44" className="h-11 w-full">
              <path
                d="M2 36 L15 32 L27 34 L40 25 L55 28 L70 18 L86 22 L102 14 L116 19 L130 8 L145 12 L166 4"
                fill="none"
                stroke="#1edb9e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="my-2.5 flex gap-1.5 overflow-x-auto py-0.5">
            {expiries.map((exp) => {
              const active = exp === activeExpiry;
              return (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExpiry(exp)}
                  className={`min-w-[72px] shrink-0 rounded-lg border px-3 py-1.5 text-center text-[10px] ${
                    active
                      ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                      : "border-[var(--line)] bg-[var(--bg2)] text-[var(--text2)] hover:border-[var(--line2)] hover:text-white"
                  }`}
                >
                  <b className="block text-[11px]">{formatExpiry(exp)}</b>
                  <small className={active ? "text-white/70" : "text-[var(--muted-text)]"}>{dte(exp)} DTE</small>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg2)]">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-3 py-2">
              <div className="flex overflow-hidden rounded-lg border border-[var(--line)]">
                {(["both", "calls", "puts"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSideView(id)}
                    className={`px-3.5 py-1 text-[10px] font-semibold ${
                      sideView === id ? "bg-[var(--blue-dim)] text-white" : "bg-[var(--bg2)] text-[var(--muted-text)]"
                    }`}
                  >
                    {id === "both" ? "All" : id === "calls" ? "Calls" : "Puts"}
                  </button>
                ))}
              </div>
              <span className="mr-auto text-[9px] text-[var(--muted-text)]">ATM {spot.toFixed(1)}</span>
              <span className="text-[9px] text-[var(--muted-text)]">Click Bid to sell · Ask to buy</span>
            </div>
            <ChainTable rows={rows} spot={spot} expiry={activeExpiry} sideView={sideView} />
            <div className="flex items-center gap-3 border-t border-[var(--line)] px-3 py-2 text-[8px] text-[var(--muted-text)]">
              <span>
                Click <b className="text-[var(--text2)]">Bid</b>{" "}
                <span className="mx-0.5 rounded bg-[var(--panel)] px-1.5 py-px text-[7px]">Sell</span> or{" "}
                <b className="text-[var(--text2)]">Ask</b>{" "}
                <span className="mx-0.5 rounded bg-[var(--panel)] px-1.5 py-px text-[7px]">Buy</span> to add a leg
              </span>
              <span className="ml-auto">⚡ Live prices</span>
            </div>
          </div>
        </div>

        <PositionPanel />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      {label} <b className="font-semibold text-[var(--text2)]">{value}</b>
    </span>
  );
}
