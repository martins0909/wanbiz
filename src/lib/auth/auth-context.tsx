import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MembershipStatus, SessionUser, UserRole } from "@/lib/types";

/**
 * Client session state mirrors the server's HTTP-only MongoDB session cookie.
 */

const MEMBERSHIP_KEY = "eventpass.membership";

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "ATTENDEE" | "ORGANIZER">;
  organizationName?: string;
  businessEmail?: string;
  businessPhone?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  membershipStatus: MembershipStatus;
  login: (email: string, password: string) => Promise<SessionUser>;
  register: (input: RegisterInput) => Promise<SessionUser>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string, token: string) => Promise<void>;
  updateProfile: (patch: Partial<SessionUser>) => void;
  setMembershipStatus: (status: MembershipStatus) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function postAuth<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Authentication request failed.");
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [membershipStatus, setStatus] = useState<MembershipStatus>("NOT_A_MEMBER");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch("/api/auth", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session check failed.");
        return (await response.json()) as { user: SessionUser | null };
      })
      .then(({ user: next }) => {
        if (active) setUser(next);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const stored = window.localStorage.getItem(MEMBERSHIP_KEY) as MembershipStatus | null;
    if (stored) setStatus(stored);
    return () => {
      active = false;
    };
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const result = await postAuth<{ user: SessionUser }>({ action: "login", email, password });
    setUser(result.user);
    return result.user;
  };

  const register: AuthContextValue["register"] = async (input) => {
    const result = await postAuth<{ user: SessionUser }>({ action: "register", ...input });
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    await postAuth<{ ok: true }>({ action: "logout" });
    setUser(null);
  };

  const setMembershipStatus = useCallback((status: MembershipStatus) => {
    setStatus(status);
    if (typeof window !== "undefined") window.localStorage.setItem(MEMBERSHIP_KEY, status);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      membershipStatus: user ? membershipStatus : "NOT_A_MEMBER",
      login,
      register,
      logout,
      requestPasswordReset: async (email) => {
        await postAuth({ action: "request-reset", email });
      },
      resetPassword: async (password, token) => {
        await postAuth({ action: "reset-password", password, token });
      },
      updateProfile: (patch) => setUser((current) => (current ? { ...current, ...patch } : null)),
      setMembershipStatus,
    }),
    [user, isLoading, membershipStatus, setMembershipStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
