"use client";

import { ReactNode } from "react";
import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="m-0 text-[26px] font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-xs text-[var(--muted-text)]">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  primary,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex items-center gap-1.5 rounded-lg border border-[var(--blue)] bg-[var(--blue)] px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-[#4bb8ff]"
    : "inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg2)] px-4 py-2 text-[11.5px] font-semibold text-[var(--text2)] hover:border-[var(--line2)] hover:bg-[var(--panel)] hover:text-white";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-4 transition hover:border-[var(--line2)] ${className}`}>
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <Panel>
      <div className="text-[10px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">{label}</div>
      <div className={`mt-1 mb-0.5 text-[26px] font-extrabold tracking-tight ${valueClass ?? ""}`}>{value}</div>
      {hint ? <div className="text-[11px] text-[var(--muted-text)]">{hint}</div> : null}
    </Panel>
  );
}
