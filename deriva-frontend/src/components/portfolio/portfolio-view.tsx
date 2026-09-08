"use client";

import { cnPos, money, signedMoney } from "@/lib/format";
import { GhostButton, KpiCard, PageHeader, Panel } from "@/components/layout/page-header";
import { usePortfolioQuery, useRiskQuery } from "@/hooks/use-market";

const GREEKS_ROWS = [
  { name: "SPY Iron Condor", delta: 12, gamma: -2.1, theta: 18, vega: -42 },
  { name: "NVDA Call Spread", delta: 34, gamma: 3.1, theta: -62, vega: 182 },
  { name: "QQQ Long Put", delta: -18, gamma: 0.5, theta: -42, vega: 76 },
];

const STRESS = [
  ["+10%", "+$4,180", "+$4,640", "+$5,020", "pos", "pos", "pos"],
  ["+5%", "+$2,210", "+$2,540", "+$2,780", "pos", "pos", "pos"],
  ["0%", "+$310", "+$1,819", "−$120", "", "hl", "neg"],
  ["−5%", "−$1,140", "−$860", "−$520", "neg", "neg", "neg"],
  ["−10%", "−$3,420", "−$2,980", "−$2,410", "neg", "neg", "neg"],
];

export function PortfolioView() {
  const { data: portfolio } = usePortfolioQuery();
  const { data: risk } = useRiskQuery();
  const pnl = (portfolio?.unrealizedPnl ?? 362) + 1457;
  const delta = risk?.totalDelta ?? 124;
  const vega = risk?.totalVega ?? 214;

  return (
    <>
      <PageHeader title="Portfolio Analysis" subtitle="Exposure, P&L, Greeks, and stress testing">
        <GhostButton>Export</GhostButton>
        <GhostButton>Scenario ▾</GhostButton>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Net P&L" value={signedMoney(pnl, 0)} hint="+3.58% since inception" valueClass={cnPos(pnl)} />
        <KpiCard label="Delta Exposure" value={`+${delta.toFixed(0)}`} hint="Equivalent share delta" />
        <KpiCard label="Vega Exposure" value={signedMoney(vega, 0)} hint="Per 1 vol point" />
        <KpiCard label="Risk Score" value="62 / 100" hint="Moderate" valueClass="text-[var(--amber)]" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">Greeks Exposure</div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-[8px] tracking-wider text-[var(--muted-text)] uppercase">
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Position</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Delta</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Gamma</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Theta</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Vega</th>
              </tr>
            </thead>
            <tbody>
              {GREEKS_ROWS.map((row) => (
                <tr key={row.name} className="hover:bg-[var(--panel)]">
                  <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-[var(--text2)]">{row.name}</td>
                  <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">{signed(row.delta)}</td>
                  <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">{row.gamma.toFixed(2)}</td>
                  <td className={`border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 ${cnPos(row.theta)}`}>
                    {signed(row.theta)}
                  </td>
                  <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">{signed(row.vega)}</td>
                </tr>
              ))}
              <tr className="font-bold text-white">
                <td className="border-t border-[var(--line)] px-2 py-1.5">Total</td>
                <td className="border-t border-[var(--line)] px-2 py-1.5">+{delta.toFixed(0)}</td>
                <td className="border-t border-[var(--line)] px-2 py-1.5">{(risk?.totalGamma ?? 4.82).toFixed(2)}</td>
                <td className={`border-t border-[var(--line)] px-2 py-1.5 ${cnPos(risk?.totalTheta ?? -86)}`}>
                  {signed(risk?.totalTheta ?? -86)}
                </td>
                <td className="border-t border-[var(--line)] px-2 py-1.5">+{vega.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
          {portfolio?.positions?.length ? (
            <div className="mt-3 text-[10px] text-[var(--muted-text)]">
              Book: {portfolio.positions.map((p) => `${p.symbol} ${p.quantity}`).join(" · ")} · cash {money(portfolio.cashBalance)}
            </div>
          ) : null}
        </Panel>

        <Panel>
          <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">Stress Test — Portfolio P&L</div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-[8px] tracking-wider text-[var(--muted-text)] uppercase">
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Underlying move</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-center">IV −10%</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-center">IV flat</th>
                <th className="border-b border-[var(--line)] px-2 py-1.5 text-center">IV +10%</th>
              </tr>
            </thead>
            <tbody>
              {STRESS.map((row) => (
                <tr key={row[0]}>
                  <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">{row[0]}</td>
                  <Cell value={row[1]} tone={row[4]} />
                  <Cell value={row[2]} tone={row[5]} />
                  <Cell value={row[3]} tone={row[6]} />
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel>
          <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">P&L Attribution</div>
          <div className="chart-grid h-[180px] overflow-hidden rounded-lg">
            <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="h-full w-full">
              <line x1="40" y1="150" x2="560" y2="150" stroke="var(--line)" strokeWidth="1" />
              <rect x="60" y="60" width="60" height="90" rx="2" fill="#1edb9e" opacity="0.85" />
              <rect x="170" y="100" width="60" height="50" rx="2" fill="#1edb9e" opacity="0.85" />
              <rect x="280" y="128" width="60" height="22" rx="2" fill="#ff6b83" opacity="0.85" />
              <rect x="390" y="80" width="60" height="70" rx="2" fill="#1edb9e" opacity="0.85" />
              <rect x="500" y="118" width="60" height="32" rx="2" fill="#1edb9e" opacity="0.85" />
            </svg>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3 text-[13px] font-bold text-[var(--text2)]">Concentration</div>
          {[
            ["SPY", 42],
            ["NVDA", 31],
            ["QQQ", 18],
            ["Other", 9],
          ].map(([name, pct]) => (
            <div key={String(name)} className="my-2">
              <div className="flex justify-between text-[10px]">
                <span>{name}</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--panel)]">
                <span
                  className="block h-full rounded-full bg-linear-to-r from-[var(--blue)] to-[var(--green)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function signed(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function Cell({ value, tone }: { value: string; tone: string }) {
  const cls =
    tone === "pos"
      ? "text-[var(--green)]"
      : tone === "neg"
        ? "text-[var(--red)]"
        : tone === "hl"
          ? "rounded bg-[var(--panel)] px-1"
          : "";
  return (
    <td className={`border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-center ${cls}`}>{value}</td>
  );
}
