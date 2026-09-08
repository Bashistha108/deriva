"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <form className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-8">
        <div className="mb-1 bg-linear-to-br from-white to-[var(--blue)] bg-clip-text text-[26px] font-black tracking-tight text-transparent">
          Deriva
        </div>
        <p className="mb-6 text-xs text-[var(--muted-text)]">Create an account</p>
        <input
          placeholder="Email"
          className="mb-3 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text2)] outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text2)] outline-none"
        />
        <button type="submit" className="h-10 w-full rounded-lg bg-[var(--blue)] text-sm font-semibold text-white">
          Sign Up
        </button>
        <p className="mt-4 text-center text-[11px] text-[var(--muted-text)]">
          <Link href="/login" className="text-[var(--blue)]">
            Already have an account
          </Link>
        </p>
      </form>
    </div>
  );
}
