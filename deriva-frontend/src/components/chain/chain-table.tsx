"use client";

import type { OptionQuote } from "@/types/api";
import { useChainStore } from "@/store/chain-store";

interface ChainRow {
  strike: number;
  call?: OptionQuote;
  put?: OptionQuote;
}

export function ChainTable({
  rows,
  spot,
  expiry,
  sideView,
}: {
  rows: ChainRow[];
  spot: number;
  expiry: string;
  sideView: "both" | "calls" | "puts";
}) {
  const addLeg = useChainStore((s) => s.addLeg);
  const atm = rows.reduce((best, row) => (Math.abs(row.strike - spot) < Math.abs(best - spot) ? row.strike : best), rows[0]?.strike ?? spot);

  if (!rows.length) {
    return <div className="px-4 py-10 text-center text-xs text-[var(--muted-text)]">No chain data for this symbol.</div>;
  }

  const showCalls = sideView !== "puts";
  const showPuts = sideView !== "calls";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr>
            {showCalls ? (
              <th colSpan={6} className="bg-[rgba(10,22,36,.5)] py-1.5 text-center text-[9px] font-semibold text-[var(--green)]">
                CALLS
              </th>
            ) : null}
            <th className="bg-[var(--panel)] py-1.5 text-center text-[var(--text2)]">STRIKE</th>
            {showPuts ? (
              <th colSpan={6} className="bg-[rgba(10,22,36,.5)] py-1.5 text-center text-[9px] font-semibold text-[var(--red)]">
                PUTS
              </th>
            ) : null}
          </tr>
          <tr className="text-[8px] tracking-wide text-[var(--muted-text)] uppercase">
            {showCalls ? (
              <>
                <Th>Bid</Th>
                <Th>Ask</Th>
                <Th>IV</Th>
                <Th>Δ</Th>
                <Th>Γ</Th>
                <Th>Last</Th>
              </>
            ) : null}
            <th className="bg-[var(--panel)]" />
            {showPuts ? (
              <>
                <Th>Last</Th>
                <Th>Δ</Th>
                <Th>Γ</Th>
                <Th>IV</Th>
                <Th>Bid</Th>
                <Th>Ask</Th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const call = row.call;
            const put = row.put;
            const isAtm = row.strike === atm;
            return (
              <tr key={row.strike} className="border-b border-[rgba(27,49,71,.3)]">
                {showCalls ? (
                  <>
                    <ClickTd
                      onClick={() =>
                        call &&
                        addLeg({
                          kind: "CALL",
                          strike: row.strike,
                          price: call.bid,
                          side: "SELL",
                          expiration: expiry,
                        })
                      }
                      className="hover:text-[var(--green)]"
                    >
                      {call?.bid.toFixed(2) ?? "—"}
                    </ClickTd>
                    <ClickTd
                      onClick={() =>
                        call &&
                        addLeg({
                          kind: "CALL",
                          strike: row.strike,
                          price: call.ask,
                          side: "BUY",
                          expiration: expiry,
                        })
                      }
                      className="hover:text-[var(--green)]"
                    >
                      {call?.ask.toFixed(2) ?? "—"}
                    </ClickTd>
                    <Td>{call ? `${(call.impliedVolatility * 100).toFixed(1)}%` : "—"}</Td>
                    <Td>{call?.delta.toFixed(2) ?? "—"}</Td>
                    <Td>{call?.gamma.toFixed(4) ?? "—"}</Td>
                    <Td>{call ? ((call.bid + call.ask) / 2).toFixed(2) : "—"}</Td>
                  </>
                ) : null}
                <td
                  className={`bg-[var(--panel)] py-1.5 text-center text-[10px] font-bold text-white ${
                    isAtm ? "bg-[var(--blue-dim)] shadow-[inset_0_0_0_1px_var(--blue)]" : ""
                  }`}
                >
                  {row.strike}
                </td>
                {showPuts ? (
                  <>
                    <Td>{put ? ((put.bid + put.ask) / 2).toFixed(2) : "—"}</Td>
                    <Td>{put?.delta.toFixed(2) ?? "—"}</Td>
                    <Td>{put?.gamma.toFixed(4) ?? "—"}</Td>
                    <Td>{put ? `${(put.impliedVolatility * 100).toFixed(1)}%` : "—"}</Td>
                    <ClickTd
                      onClick={() =>
                        put &&
                        addLeg({
                          kind: "PUT",
                          strike: row.strike,
                          price: put.bid,
                          side: "SELL",
                          expiration: expiry,
                        })
                      }
                      className="hover:text-[var(--red)]"
                    >
                      {put?.bid.toFixed(2) ?? "—"}
                    </ClickTd>
                    <ClickTd
                      onClick={() =>
                        put &&
                        addLeg({
                          kind: "PUT",
                          strike: row.strike,
                          price: put.ask,
                          side: "BUY",
                          expiration: expiry,
                        })
                      }
                      className="hover:text-[var(--red)]"
                    >
                      {put?.ask.toFixed(2) ?? "—"}
                    </ClickTd>
                  </>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: string }) {
  return <th className="bg-[rgba(10,22,36,.5)] px-1 py-1.5 text-right font-semibold">{children}</th>;
}

function Td({ children }: { children: string }) {
  return <td className="px-1 py-1.5 text-right text-[var(--text2)]">{children}</td>;
}

function ClickTd({
  children,
  onClick,
  className = "",
}: {
  children: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <td
      onClick={onClick}
      className={`cursor-pointer px-1 py-1.5 text-right text-[var(--text2)] hover:bg-[var(--panel-2)] hover:text-white ${className}`}
    >
      {children}
    </td>
  );
}
