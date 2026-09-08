"use client";

import { useMemo, useState } from "react";
import { DEMO_ORDERS } from "@/lib/data/mocks";
import { GhostButton, PageHeader, Panel } from "@/components/layout/page-header";
import { useTradesQuery } from "@/hooks/use-market";

type Tab = "open" | "filled" | "closed" | "all";

export function TradesView() {
  const [tab, setTab] = useState<Tab>("open");
  const { data: ledger = [] } = useTradesQuery();

  const rows = useMemo(() => {
    if (tab === "filled" && ledger.length) {
      return ledger.map((t) => ({
        id: `#${t.executionId.slice(0, 4)}`,
        symbol: t.symbol,
        strategy: "Execution",
        type: "MARKET",
        qty: t.quantity,
        expiration: new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        status: "FILLED",
      }));
    }
    if (tab === "all") {
      return [...DEMO_ORDERS.open, ...DEMO_ORDERS.filled, ...DEMO_ORDERS.closed];
    }
    return DEMO_ORDERS[tab];
  }, [tab, ledger]);

  return (
    <>
      <PageHeader title="Trades" subtitle="Orders, executions, and completed positions">
        <GhostButton>Export CSV</GhostButton>
        <GhostButton href="/options" primary>
          ＋ New Order
        </GhostButton>
      </PageHeader>

      <div className="mb-3.5 flex gap-1 border-b border-[var(--line)]">
        {(
          [
            ["open", "Open Orders", DEMO_ORDERS.open.length],
            ["filled", "Filled", null],
            ["closed", "Closed", null],
            ["all", "All Trades", null],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative px-3.5 py-2 text-[11px] font-semibold ${
              tab === id ? "text-white" : "text-[var(--muted-text)] hover:text-[var(--text2)]"
            }`}
          >
            {label}
            {count ? (
              <span className="ml-1 rounded-full bg-[var(--blue-dim)] px-1.5 text-[8px] font-bold text-[var(--blue)]">
                {count}
              </span>
            ) : null}
            {tab === id ? <span className="absolute right-3.5 -bottom-px left-3.5 h-0.5 rounded-full bg-[var(--blue)]" /> : null}
          </button>
        ))}
      </div>

      <Panel className="p-0">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[8px] tracking-wider text-[var(--muted-text)] uppercase">
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Order</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Symbol</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Strategy</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Type</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Qty</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Expiration</th>
              <th className="border-b border-[var(--line)] px-2 py-1.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.id}-${row.status}`} className="hover:bg-[var(--panel)]">
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-[var(--text2)]">{row.id}</td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">
                  <b>{row.symbol}</b>
                </td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-[var(--text2)]">{row.strategy}</td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-[var(--text2)]">{row.type}</td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">{row.qty}</td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5 text-[var(--text2)]">{row.expiration}</td>
                <td className="border-b border-[rgba(27,49,71,.3)] px-2 py-1.5">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "CLOSED"
      ? "bg-[var(--red-dim)] text-[var(--red)]"
      : status === "FILLED"
        ? "bg-[var(--green-dim)] text-[var(--green)]"
        : "bg-[var(--amber-dim)] text-[var(--amber)]";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold ${tone}`}>{status}</span>;
}
