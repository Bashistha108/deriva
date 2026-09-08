import { create } from "zustand";

interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, accountId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  accountId: null,
  isAuthenticated: false,
  setAuth: (token, accountId) => set({ token, accountId, isAuthenticated: true }),
  logout: () => set({ token: null, accountId: null, isAuthenticated: false }),
}));
