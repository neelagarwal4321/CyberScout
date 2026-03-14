import { createContext, useContext, useState, ReactNode } from "react";

export type SubscriptionTier = "free" | "pro" | "max";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: SubscriptionTier;
  xp: number;
  level: number;
  streak: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const MOCK_USER: User = {
  id: "user-001",
  name: "Alex Chen",
  email: "alex@example.com",
  tier: "free",
  xp: 2840,
  level: 12,
  streak: 7,
  joinedAt: "2024-01-15",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (_email: string, _password: string) => {
    // Mock: simulate API delay
    await new Promise((r) => setTimeout(r, 500));
    setUser(MOCK_USER);
  };

  const loginWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setUser({ ...MOCK_USER, name: "Alex Chen (Google)" });
  };

  const loginWithApple = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setUser({ ...MOCK_USER, name: "Alex Chen (Apple)" });
  };

  const signup = async (_email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 500));
    setUser({ ...MOCK_USER, name });
  };

  const logout = () => setUser(null);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, loginWithGoogle, loginWithApple, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
