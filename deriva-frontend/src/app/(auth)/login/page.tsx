"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { DEFAULT_ACCOUNT_ID, useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const tokens = await api.login(username, password);
      setAuth(tokens.accessToken, DEFAULT_ACCOUNT_ID);
      router.push("/");
    } catch {
      setError("Could not reach the API. Check that the backend is running on :8080.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-8"
      >
        <div className="mb-1 bg-linear-to-br from-white to-[var(--blue)] bg-clip-text text-[26px] font-black tracking-tight text-transparent">
          Deriva
        </div>
        <p className="mb-6 text-xs text-[var(--muted-text)]">Sign in to submit orders</p>
        <label className="mb-3 block">
          <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text2)] outline-none focus:border-[var(--blue)]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[var(--muted-text)] uppercase">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--text2)] outline-none focus:border-[var(--blue)]"
          />
        </label>
        {error ? <p className="mb-3 text-[11px] text-[var(--red)]">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full rounded-lg bg-[var(--blue)] text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Login"}
        </button>
        <p className="mt-4 text-center text-[11px] text-[var(--muted-text)]">
          <Link href="/" className="text-[var(--blue)]">
            Continue without signing in
          </Link>
          {" · "}
          <Link href="/register" className="text-[var(--blue)]">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
