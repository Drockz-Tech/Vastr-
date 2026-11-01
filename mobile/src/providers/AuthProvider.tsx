import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AuthService } from '../services/AuthService';
import { Logger } from '../lib/Logger';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  initializationError: Error | null;
  signIn: (email: string, password: string) => Promise<Error | null>;
  signUp: (email: string, password: string) => Promise<Error | null>;
  signOut: () => Promise<Error | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    AuthService.getSession().then((response) => {
      if (mounted) {
        setSession(response.data);
        setInitializationError(response.error);
        setIsLoading(false);
      }
      if (response.error) {
        Logger.error(response.error, { phase: 'session_restore' });
      }
    });

    const { data } = AuthService.onAuthStateChange((nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isLoading,
    initializationError,
    async signIn(email, password) {
      const response = await AuthService.signIn(email, password);
      if (response.success) {
        setSession(response.data);
        return null;
      }
      return response.error;
    },
    async signUp(email, password) {
      const response = await AuthService.signUp(email, password);
      if (response.success) {
        setSession(response.data);
        return null;
      }
      return response.error;
    },
    async signOut() {
      const response = await AuthService.signOut();
      if (response.success) {
        setSession(null);
        return null;
      }
      return response.error;
    },
  }), [initializationError, isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
