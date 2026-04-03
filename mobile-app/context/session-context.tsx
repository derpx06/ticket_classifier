import React, { createContext, useContext, useMemo, useState } from 'react';
import { AuthUser, loginRequest } from '@/services/auth-service';

type SessionContextType = {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggingIn: boolean;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const response = await loginRequest(email, password);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role || null,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      isLoggingIn,
    }),
    [isLoggingIn, token, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return context;
}
