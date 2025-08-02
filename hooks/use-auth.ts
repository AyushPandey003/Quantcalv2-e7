'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@/lib/db/schema';
import { getCurrentUser, refreshTokenAction, logoutAction } from '@/actions/auth';

export interface UseAuthReturn {
  user: Omit<User, 'passwordHash'> | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser || null);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAction();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if logout fails
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const result = await refreshTokenAction();
      if (result.success && result.data) {
        setUser(result.data);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;

    // Set up periodic token refresh
    const interval = setInterval(async () => {
      await refreshToken();
    }, 14 * 60 * 1000); // Refresh every 14 minutes (tokens expire in 15)

    return () => clearInterval(interval);
  }, [user?.id, refreshToken]);

  return {
    user,
    loading,
    refreshUser,
    logout,
    isAuthenticated: !!user,
  };
}

// Hook for protecting routes that require authentication
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      window.location.href = '/login';
    }
  }, [user, loading, redirecting]);

  return { user, loading: loading || redirecting };
}

// Hook for routes that should redirect authenticated users (like login/register pages)
export function useRedirectIfAuth(redirectTo: string = '/dashboard') {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true);
      window.location.href = redirectTo;
    }
  }, [user, loading, redirecting, redirectTo]);

  return { user, loading: loading || redirecting };
}
