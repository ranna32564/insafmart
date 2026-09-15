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
import { apiRequest, getAuthToken, queryClient, setAuthToken } from "./query-client";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  isVerified: number;
  isAdmin: number;
  createdAt: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;

  // OTP-based (old flow — kept for backward compatibility)
  requestOtp: (input: { email: string; name?: string; phone?: string }) => Promise<{
    message: string;
    emailDelivered: boolean;
    isNewAccount: boolean;
    previewCode?: string;
  }>;
  verifyOtp: (email: string, code: string) => Promise<SessionUser>;

  // Password-based (new flow)
  register: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{
    message: string;
    emailDelivered: boolean;
    previewCode?: string;
  }>;
  verifyRegister: (email: string, code: string) => Promise<SessionUser>;
  loginWithPassword: (email: string, password: string) => Promise<SessionUser>;

  // Shared
  adminLogin: (email: string, password: string) => Promise<SessionUser>;
  updateProfile: (patch: {
    name?: string;
    phone?: string;
    address?: string;
  }) => Promise<SessionUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(getAuthToken()));

  // Restore the session on first load if a token survived in storage.
  useEffect(() => {
    let cancelled = false;
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const me = (await res.json()) as SessionUser;
        if (!cancelled) setUser(me);
      } catch {
        setAuthToken(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------- OLD OTP FLOW (kept) ------------------------- */

  const requestOtp = useCallback(
    async (input: { email: string; name?: string; phone?: string }) => {
      const res = await apiRequest("POST", "/api/auth/request-otp", input);
      return res.json();
    },
    [],
  );

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const res = await apiRequest("POST", "/api/auth/verify-otp", { email, code });
    const data = (await res.json()) as { token: string; user: SessionUser };
    setAuthToken(data.token);
    setUser(data.user);
    await queryClient.invalidateQueries();
    return data.user;
  }, []);

  /* ---------------------------- NEW REGISTER FLOW ------------------------- */

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", input);
      return res.json();
    },
    [],
  );

  const verifyRegister = useCallback(async (email: string, code: string) => {
    const res = await apiRequest("POST", "/api/auth/verify-register", {
      email,
      code,
    });
    const data = (await res.json()) as { token: string; user: SessionUser };
    setAuthToken(data.token);
    setUser(data.user);
    await queryClient.invalidateQueries();
    return data.user;
  }, []);

  /* ----------------------------- PASSWORD LOGIN --------------------------- */

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest("POST", "/api/auth/password-login", {
        email,
        password,
      });
      const data = (await res.json()) as { token: string; user: SessionUser };
      setAuthToken(data.token);
      setUser(data.user);
      await queryClient.invalidateQueries();
      return data.user;
    },
    [],
  );

  /* ------------------------------- ADMIN LOGIN ---------------------------- */

  const adminLogin = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/admin-login", { email, password });
    const data = (await res.json()) as { token: string; user: SessionUser };
    setAuthToken(data.token);
    setUser(data.user);
    await queryClient.invalidateQueries();
    return data.user;
  }, []);

  /* ------------------------------ UPDATE PROFILE -------------------------- */

  const updateProfile = useCallback(
    async (patch: { name?: string; phone?: string; address?: string }) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", patch);
      const updated = (await res.json()) as SessionUser;
      setUser(updated);
      return updated;
    },
    [],
  );

  /* --------------------------------- SIGN OUT ----------------------------- */

  const signOut = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {
      /* the token is being discarded either way */
    }
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  /* ------------------------------ Context Value --------------------------- */

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      requestOtp,
      verifyOtp,
      register,
      verifyRegister,
      loginWithPassword,
      adminLogin,
      updateProfile,
      signOut,
    }),
    [
      user,
      isLoading,
      requestOtp,
      verifyOtp,
      register,
      verifyRegister,
      loginWithPassword,
      adminLogin,
      updateProfile,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}