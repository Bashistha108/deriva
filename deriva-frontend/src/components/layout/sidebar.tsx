"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, LayoutGrid, Layers, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { etTime, isMarketOpen } from "@/lib/format";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/options", label: "Options Chain", icon: Layers },
  { href: "/portfolio", label: "Portfolio", icon: Target },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [clock, setClock] = useState("—");

  useEffect(() => {
    const tick = () => {
      setOpen(isMarketOpen());
      setClock(`${etTime()} ET`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="sticky top-0 z-10 hidden h-screen w-[200px] flex-col border-r border-[var(--line)] bg-[var(--bg2)] px-3.5 py-5 md:flex">
      <div className="mb-0.5 ml-2 bg-linear-to-br from-white to-[var(--blue)] bg-clip-text text-[26px] font-black tracking-tight text-transparent">
        Deriva
      </div>
      <div className="mb-7 ml-2.5 text-[9px] font-medium tracking-[0.12em] text-[var(--muted-text)] uppercase">
        Options Analytics
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12.5px] font-medium transition-colors",
                active
                  ? "bg-[var(--blue-dim)] text-white shadow-[inset_3px_0_0_var(--blue)]"
                  : "text-[var(--muted-text)] hover:bg-white/4 hover:text-white",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "opacity-100" : "opacity-60")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-1 border-t border-[var(--line)] pt-4">
        <div className="flex items-center text-[11px] font-medium text-[var(--text2)]">
          <span
            className={cn(
              "mr-2 inline-block size-[7px] rounded-full animate-pulse-dot",
              open ? "bg-[var(--green)]" : "bg-[var(--amber)]",
            )}
          />
          {open ? "Market Open" : "Market Closed"}
        </div>
        <div className="mt-0.5 text-[9px] text-[var(--muted-text)]">{clock} · live desk</div>
      </div>
    </aside>
  );
}
