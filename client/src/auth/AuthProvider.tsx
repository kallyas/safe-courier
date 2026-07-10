import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthContextValue } from "./authContext";
import { authApi } from "./authApi";
import { tokenStore, UNAUTHORIZED_EVENT } from "@/lib/token";
import { queryClient } from "@/lib/queryClient";
import type { TokenClaims } from "@/types/api";

function decodeValid(token: string | null): TokenClaims | null {
  if (!token) return null;
  try {
    const claims = jwtDecode<TokenClaims>(token);
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<TokenClaims | null>(() =>
    decodeValid(tokenStore.get()),
  );

  // Drop a token that is present but already expired/invalid.
  useEffect(() => {
    if (tokenStore.get() && !claims) tokenStore.clear();
  }, [claims]);

  const login = useCallback((token: string) => {
    tokenStore.set(token);
    setClaims(decodeValid(token));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokenStore.get()) await authApi.logout();
    } catch {
      // best-effort revocation; clear locally regardless
    }
    tokenStore.clear();
    setClaims(null);
    queryClient.clear();
  }, []);

  // React to a 401 surfaced by the axios interceptor.
  useEffect(() => {
    const handler = () => {
      setClaims(null);
      queryClient.clear();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(claims),
      claims,
      isAdmin: Boolean(claims && (claims.isAdmin || claims.role === "admin")),
      login,
      logout,
    }),
    [claims, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
