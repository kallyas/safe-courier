import { createContext } from "react";
import type { TokenClaims } from "@/types/api";

export interface AuthContextValue {
  isAuthenticated: boolean;
  claims: TokenClaims | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
