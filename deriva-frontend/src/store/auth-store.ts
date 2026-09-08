import { create } from "zustand";

const STORAGE_KEY = "deriva-auth";

interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (token: string, accountId: string) => void;
  logout: () => void;
}

export const DEFAULT_ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  accountId: null,
  isAuthenticated: false,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as { token?: string; accountId?: string };
      set({
        token: parsed.token ?? null,
        accountId: parsed.accountId ?? null,
        isAuthenticated: Boolean(parsed.token),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  setAuth: (token, accountId) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, accountId }));
    }
    set({ token, accountId, isAuthenticated: true, hydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ token: null, accountId: null, isAuthenticated: false, hydrated: true });
  },
}));
