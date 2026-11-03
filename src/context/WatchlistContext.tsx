'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types/movie';
import { useUser } from './UserContext';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchWatchlist(user: string): Promise<Movie[]> {
  try {
    const res = await fetch(`/api/watchlist?user=${encodeURIComponent(user)}`);
    const data = await res.json();
    return Array.isArray(data.watchlist) ? data.watchlist : [];
  } catch {
    return [];
  }
}

async function saveWatchlist(user: string, watchlist: Movie[]) {
  try {
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, watchlist }),
    });
  } catch {
    // silent — local state still up-to-date
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { username } = useUser();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [ready, setReady] = useState(false);

  // Load watchlist whenever the logged-in user changes
  useEffect(() => {
    setReady(false);
    if (username) {
      // Logged in → fetch from server JSON
      fetchWatchlist(username).then((list) => {
        setWatchlist(list);
        setReady(true);
      });
    } else {
      // Guest → use localStorage
      try {
        const raw = localStorage.getItem('stitch_watchlist_guest');
        setWatchlist(raw ? JSON.parse(raw) : []);
      } catch {
        setWatchlist([]);
      }
      setReady(true);
    }
  }, [username]);

  // Persist whenever watchlist changes (after initial load)
  useEffect(() => {
    if (!ready) return;
    if (username) {
      saveWatchlist(username, watchlist);
    } else {
      try {
        localStorage.setItem('stitch_watchlist_guest', JSON.stringify(watchlist));
      } catch { /* ignore */ }
    }
  }, [watchlist, ready, username]);

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId: number) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const isInWatchlist = useCallback(
    (movieId: number) => watchlist.some((m) => m.id === movieId),
    [watchlist]
  );

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within a WatchlistProvider');
  return ctx;
}
