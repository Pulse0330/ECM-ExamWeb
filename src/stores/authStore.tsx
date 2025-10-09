import Cookies from "js-cookie";
import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type { Profile } from "@/types/login";

type AuthState = {
  token: string | null;
  user: Profile | null;
  setAuth: (token: string, user: Profile) => void;
  clearAuth: () => void;
};
// Custom cookie storage
const cookieStorage = {
  getItem: (
    name: string
  ): StorageValue<{ token: string | null; user: Profile | null }> | null => {
    const value = Cookies.get(name);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
  setItem: (
    name: string,
    value: StorageValue<{ token: string | null; user: Profile | null }>
  ): void => {
    Cookies.set(name, JSON.stringify(value), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name, { path: "/" });
  },
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => {
        Cookies.remove("auth-storage", { path: "/" });
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: cookieStorage,
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
