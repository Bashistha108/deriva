"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { DEFAULT_ACCOUNT_ID, useAuthStore } from "@/store/auth-store";
import { useChainStore } from "@/store/chain-store";
import { breakeven, detectStrategy, maxProfitLoss, netPremium, payoffPath } from "@/lib/trading/strategy";
import { formatExpiry } from "@/lib/trading/strategy";

export function PositionPanel() {
  const symbol = useChainStore((s) => s.symbol);
  const lastPrice = useChainStore((s) => s.lastPrice);
  const legs = useChainStore((s) => s.legs);
  const qty = useChainStore((s) => s.qty);
  const setQty = useChainStore((s) => s.setQty);
  const removeLeg = useChainStore((s) => s.removeLeg);
  const clear = useChainStore((s) => s.clear);
  const accountId = useAuthStore((s) => s.accountId) ?? DEFAULT_ACCOUNT_ID;
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const premium = netPremium(legs, qty);
  const { maxProfit, maxLoss } = maxProfitLoss(legs, qty);

  async function reviewOrder() {
    if (!token) {
      router.push("/login");
      return;
    }
    setPending(true);
    setStatus(null);
    try {
      const order = await api.submitOrder({
        accountId,
        idempotencyKey: crypto.randomUUID(),
        type: "LIMIT",
        legs: legs.map((leg) => ({
          symbol: `${symbol}${leg.strike}${leg.kind[0]}`,
          side: leg.side,
          quantity: qty,
        })),
      });
      setStatus(`Submitted ${order.status} · ${order.orderId}`);
      clear();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Order failed — is the API running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="min-h-[620px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg2)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3.5">
        <div>
          <b className="text-[13px]">Position</b>
          <small className="mt-px block text-[9px] font-normal text-[var(--muted-text)]">Build from chain</small>
        </div>
        <button type="button" onClick={clear} className="text-[9px] font-semibold text-[var(--blue)] hover:text-white">
          Clear All
        </button>
      </div>

      {!legs.length ? (
        <div className="px-6 py-16 text-center text-[var(--muted-text)]">
          <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full border-[1.5px] border-dashed border-[var(--line2)] text-xl text-[var(--blue)]">
            ＋
          </div>
          <b className="block text-[13px] text-[var(--text2)]">Select an option</b>
          <span className="mt-1 block text-[10px] leading-relaxed">Click a Bid or Ask in the chain to start building.</span>
        </div>
      ) : (
        <div>
          {legs.map((leg, i) => (
            <div key={`${leg.kind}-${leg.strike}-${i}`} className="border-b border-[rgba(27,49,71,.3)] px-4 py-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[8px] font-extrabold tracking-wide uppercase ${
                    leg.side === "BUY" ? "bg-[var(--green-dim)] text-[var(--green)]" : "bg-[var(--red-dim)] text-[var(--red)]"
                  }`}
                >
                  {leg.side}
                </span>
                <span className="text-[13px] font-bold">${leg.price.toFixed(2)}</span>
              </div>
              <div className="mt-1 text-[11px] font-bold">
                {symbol} {leg.strike} {leg.kind}
              </div>
              <div className="mt-0.5 flex items-center gap-2.5 text-[8px] text-[var(--muted-text)]">
                {formatExpiry(leg.expiration)}, 2026 · {leg.kind === "CALL" ? "Call" : "Put"} ·{" "}
                <button type="button" onClick={() => removeLeg(i)} className="text-[var(--red)] hover:text-[#ff8ca1]">
                  remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 border-b border-[rgba(27,49,71,.3)] px-4 py-2.5 text-[10px]">
            <span className="mr-auto text-[var(--muted-text)]">Quantity</span>
            <button
              type="button"
              onClick={() => setQty(qty - 1)}
              className="grid size-7 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--text2)]"
            >
              −
            </button>
            <b className="min-w-5 text-center text-sm">{qty}</b>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="grid size-7 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--text2)]"
            >
              ＋
            </button>
          </div>

          <button
            type="button"
            onClick={reviewOrder}
            disabled={pending}
            className="mx-4 my-2.5 inline-flex w-[calc(100%-32px)] items-center justify-center rounded-lg border border-[var(--blue)] bg-[var(--blue)] py-2 text-[11.5px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Submitting…" : token ? "Review Order" : "Sign in to submit"}
          </button>

          {status ? <div className="px-4 pb-2 text-[9px] text-[var(--text2)]">{status}</div> : null}

          <div className="mx-4 mt-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5">
            <Row label="Strategy" value={detectStrategy(legs)} />
            <Row label="Net debit / credit" value={`${premium >= 0 ? "+$" : "-$"}${Math.abs(premium).toFixed(0)}`} />
            <Row label="Breakeven" value={breakeven(legs)} />
          </div>

          <div className="mx-4 mt-2 mb-1 text-[10px] font-bold text-[var(--text2)]">P/L at expiration</div>
          <div className="chart-grid mx-3 mb-1 h-[200px] overflow-hidden rounded-lg border border-[var(--line)]">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="block h-full w-full">
              <line x1="0" y1="100" x2="600" y2="100" stroke="var(--line2)" strokeWidth="1" />
              <line x1="300" y1="0" x2="300" y2="200" stroke="var(--line2)" strokeWidth="1" />
              <path d={payoffPath(legs, qty, lastPrice)} fill="none" stroke="#1edb9e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex justify-between px-3.5 pb-1 text-[7px] text-[var(--muted-text)]">
            <span>−$1k</span>
            <span>+$1k</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-4 pb-3.5">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-2">
              <span className="block text-[7px] tracking-wider text-[var(--muted-text)] uppercase">Max Profit</span>
              <b className="mt-0.5 block text-sm text-[var(--green)]">{maxProfit}</b>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-2">
              <span className="block text-[7px] tracking-wider text-[var(--muted-text)] uppercase">Max Loss</span>
              <b className="mt-0.5 block text-sm text-[var(--red)]">{maxLoss}</b>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-[9px]">
      <span className="text-[var(--muted-text)]">{label}</span>
      <b className="text-[var(--text2)]">{value}</b>
    </div>
  );
}
