"use client";

import { SPARK_PATHS, WATCHLIST } from "@/lib/data/mocks";
import { cnPos, money, pct, signedMoney } from "@/lib/format";
import { GhostButton, KpiCard, PageHeader, Panel } from "@/components/layout/page-header";
import { usePortfolioQuery, useQuoteQuery, useRiskQuery } from "@/hooks/use-market";
import { useChainStore } from "@/store/chain-store";
import { useRouter } from "next/navigation";

export function DashboardView() {
  const { data: portfolio } = usePortfolioQuery();
  const { data: risk } = useRiskQuery();
  const netLiq = (portfolio?.cashBalance ?? 21300) + 31130;
  const dayPnl = (portfolio?.unrealizedPnl ?? 362) + 120;
  const buyingPower = portfolio?.cashBalance ?? 21300;
  const theta = risk?.totalTheta ?? 86.2;
  const margin = risk?.marginUsage ?? 0.42;
  const marginPct = margin <= 1 ? margin * 100 : margin;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of your options portfolio">
        <GhostButton>Today ▾</GhostButton>
        <GhostButton href="/options" primary>
          ＋ New Trade
        </GhostButton>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net Liquidation"
          value={money(netLiq, 0)}
          hint={`▲ ${signedMoney(dayPnl, 2)} · ${pct((dayPnl / netLiq) * 100)}`}
          valueClass="text-white"
        />
        <KpiCard
          label="Day P&L"
          value={signedMoney(dayPnl, 0)}
          hint="Realized +$120 · Unrealized from book"
          valueClass={cnPos(dayPnl)}
        />
        <Panel>
          <div className="text-[10px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">Buying Power</div>
          <div className="mt-1 mb-0.5 text-[26px] font-extrabold tracking-tight">{money(buyingPower, 0)}</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--panel)]">
            <span className="block h-full rounded-full bg-linear-to-r from-[var(--blue)] to-[var(--green)]" style={{ width: "59%" }} />
          </div>
          <div className="mt-1.5 text-[11px] text-[var(--muted-text)]">59% available</div>
        </Panel>
        <KpiCard
          label="Portfolio Theta"
          value={signedMoney(theta, 2)}
          hint="Estimated daily decay"
          valueClass={cnPos(theta)}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="text-[13px] font-bold text-[var(--text2)]">Performance</div>
            <div className="flex gap-2 text-[11px] text-[var(--muted-text)]">
              {["1D", "1W", "1M", "3M", "1Y"].map((r) => (
                <span key={r} className={r === "1M" ? "font-bold text-[var(--text2)]" : "opacity-50"}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="chart-grid mt-2 h-[240px] overflow-hidden rounded-lg">
            <svg viewBox="0 0 800 240" preserveAspectRatio="none" className="block h-full w-full">
              <defs>
                <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#3aadff" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#3aadff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 186 C40 192 70 170 110 176 S180 152 215 164 S270 124 310 136 S370 104 410 118 S470 84 515 98 S575 54 615 74 S675 38 715 54 S760 24 800 34 L800 240 L0 240Z"
                fill="url(#areaGrad)"
              />
              <path
                d="M0 186 C40 192 70 170 110 176 S180 152 215 164 S270 124 310 136 S370 104 410 118 S470 84 515 98 S575 54 615 74 S675 38 715 54 S760 24 800 34"
                fill="none"
                stroke="#3aadff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="760" cy="24" r="4.5" fill="#1edb9e" />
            </svg>
          </div>
          <div className="flex justify-between px-2 pt-1 text-[8px] tracking-wider text-[var(--muted-text)]">
            <span>Aug 11</span>
            <span>Aug 18</span>
            <span>Aug 25</span>
            <span>Sep 1</span>
            <span>Sep 8</span>
          </div>
        </Panel>

        <Panel>
          <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">Risk Snapshot</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <RiskItem label="Delta" value={`+${(risk?.totalDelta ?? 124).toFixed(0)}`} />
            <RiskItem label="Gamma" value={`${(risk?.totalGamma ?? 4.82).toFixed(2)}`} />
            <RiskItem label="Vega" value={`${(risk?.totalVega ?? 214).toFixed(0)}`} />
            <RiskItem label="Theta" value={`${(risk?.totalTheta ?? 86).toFixed(0)}`} pos />
          </div>
          <div className="mt-3.5">
            <div className="text-[8px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">Margin Usage</div>
            <div className="my-1 flex justify-between text-[10px]">
              <span>{marginPct.toFixed(0)}%</span>
              <span className="text-[var(--muted-text)]">$11,940 / $28,500</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel)]">
              <span
                className="block h-full rounded-full bg-linear-to-r from-[var(--blue)] to-[var(--green)]"
                style={{ width: `${Math.min(100, marginPct)}%` }}
              />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="text-[8px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">Alerts</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <span>
                <span className="text-[var(--amber)]">●</span> SPY iron condor enters final week
              </span>
              <span>
                <span className="text-[var(--amber)]">●</span> NVDA delta concentration elevated
              </span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-3">
        <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">Watchlist</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {WATCHLIST.slice(0, 4).map((item) => (
            <WatchTile key={item.symbol} symbol={item.symbol} fallback={item.price} fallbackChg={item.change} />
          ))}
        </div>
      </Panel>
    </>
  );
}

function RiskItem({ label, value, pos }: { label: string; value: string; pos?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-center">
      <div className="text-[8px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">{label}</div>
      <div className={`mt-0.5 text-[18px] font-extrabold ${pos ? "text-[var(--green)]" : ""}`}>{value}</div>
    </div>
  );
}

function WatchTile({
  symbol,
  fallback,
  fallbackChg,
}: {
  symbol: string;
  fallback: number;
  fallbackChg: number;
}) {
  const { data } = useQuoteQuery(symbol);
  const setSymbol = useChainStore((s) => s.setSymbol);
  const router = useRouter();
  const price = data?.lastPrice ?? fallback;
  const chg = fallbackChg;
  const pos = chg >= 0;
  const spark = SPARK_PATHS[symbol] ?? SPARK_PATHS.SPY;

  return (
    <button
      type="button"
      onClick={() => {
        setSymbol(symbol, symbol, price, chg);
        router.push("/options");
      }}
      className="cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-left transition hover:border-[var(--line2)] hover:bg-[var(--panel-2)]"
    >
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span>{symbol}</span>
        <span className={pos ? "text-[var(--green)]" : "text-[var(--red)]"}>{pct(chg)}</span>
      </div>
      <div className="mt-0.5 mb-1 text-sm font-bold">{price.toFixed(2)}</div>
      <svg viewBox="0 0 150 32" className="h-8 w-full">
        <path d={spark} fill="none" stroke={pos ? "#1edb9e" : "#ff6b83"} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
