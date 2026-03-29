'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

const STORAGE_KEY = 'playgame_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((name: string, email?: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);
    }
  }, [user]);

  return {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
}
