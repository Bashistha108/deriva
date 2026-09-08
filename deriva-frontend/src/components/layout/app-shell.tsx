"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[200px_1fr]">
      <Sidebar />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 pb-10 md:px-6">
        <Topbar />
        <div className="animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
