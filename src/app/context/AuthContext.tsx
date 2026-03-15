import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../../services/api";

export type SubscriptionTier = "free" | "pro" | "max";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: SubscriptionTier;
  xp: number;
  level: string;
  streak: number;
  joinedAt: string;
  interests?: string[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signup: (email: string, password: string, name: string, options?: { experienceLevel?: string; interests?: string[] }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

interface AuthResponse {
  data: {
    user: User;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<{ data: User }>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    setUser(res.data.user);
  };

  const loginWithGoogle = async () => {
    // OAuth flow: redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env["VITE_API_URL"] ?? "http://localhost:3000/api"}/auth/oauth/google`;
  };

  const loginWithApple = async () => {
    window.location.href = `${import.meta.env["VITE_API_URL"] ?? "http://localhost:3000/api"}/auth/oauth/apple`;
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    options?: { experienceLevel?: string; interests?: string[] },
  ) => {
    const res = await api.post<AuthResponse>("/auth/signup", {
      email,
      password,
      name,
      experienceLevel: options?.experienceLevel,
      interests: options?.interests,
    });
    setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("cs_refresh_token");
      await api.post("/auth/logout", { refreshToken }).catch(() => {});
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithApple,
        signup,
        logout,
        updateUser,
      }}
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
