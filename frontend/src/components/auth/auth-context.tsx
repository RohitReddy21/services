"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicUser } from "@/types/auth";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  verifyTwoFactorLoginRequest,
} from "@/lib/api/auth-client";

type LoginResult = { requiresTwoFactor: true; pendingToken: string } | { requiresTwoFactor: false };

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeTwoFactorLogin: (pendingToken: string, code: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await meRequest();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    meRequest()
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await loginRequest({ email, password });
    if ("requiresTwoFactor" in result) {
      return { requiresTwoFactor: true, pendingToken: result.pendingToken };
    }
    setUser(result.user);
    return { requiresTwoFactor: false };
  }, []);

  const completeTwoFactorLogin = useCallback(async (pendingToken: string, code: string) => {
    const { user } = await verifyTwoFactorLoginRequest(pendingToken, code);
    setUser(user);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      password: string;
      referralCode?: string;
    }) => {
      // Register no longer starts a session — the caller sends the user to the
      // login page to sign in.
      await registerRequest(input);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, completeTwoFactorLogin, register, logout, refresh }),
    [user, loading, login, completeTwoFactorLogin, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
