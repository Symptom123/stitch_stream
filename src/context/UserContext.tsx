'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  username: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stitch_user');
    if (saved) setUsername(saved);
  }, []);

  const login = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    localStorage.setItem('stitch_user', clean);
    setUsername(clean);
  };

  const logout = () => {
    localStorage.removeItem('stitch_user');
    setUsername(null);
  };

  return (
    <UserContext.Provider value={{ username, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
