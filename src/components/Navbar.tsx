'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { searchTitles, getImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { useUser } from '@/context/UserContext';
import {
  SearchIcon,
  CloseIcon,
  PlayIcon,
  HeartIcon,
  MenuIcon,
  FlameIcon,
} from './Icons';

interface NavbarProps {
  onSelectMovie: (movie: Movie) => void;
  onFilterChange: (filter: 'all' | 'movie' | 'tv' | 'watchlist') => void;
  activeFilter: 'all' | 'movie' | 'tv' | 'watchlist';
}

export function Navbar({ onSelectMovie, onFilterChange, activeFilter }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loginInput, setLoginInput] = useState('');

  const { watchlist } = useWatchlist();
  const { username, login, logout } = useUser();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchTitles(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };
  const handleCloseSearch = () => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); };

  const avatarLabel = username
    ? username.slice(0, 2).toUpperCase()
    : 'SS';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090a0f]/95 backdrop-blur-md shadow-xl border-b border-gray-900/80 py-3'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <button onClick={() => onFilterChange('all')} className="flex items-center gap-2.5 group text-left">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-purple-600/40 group-hover:scale-105 transition-transform bg-purple-700 flex items-center justify-center">
                <Image src="/05_app_icon.svg" alt="Stitch Stream Logo" width={36} height={36} unoptimized className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-white">STITCH <span className="text-purple-400">STREAM</span></span>
                <span className="text-[9px] tracking-widest uppercase font-bold text-gray-400 -mt-1">Streaming, Stitched Together</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {(['all', 'movie', 'tv'] as const).map((f, i) => (
                <button key={f} onClick={() => onFilterChange(f)}
                  className={`transition-colors ${activeFilter === f ? 'text-white font-semibold border-b-2 border-purple-500 pb-1' : 'text-gray-400 hover:text-white'}`}>
                  {['Home','Movies','TV Series'][i]}
                </button>
              ))}
              <button onClick={() => onFilterChange('watchlist')}
                className={`flex items-center gap-1.5 transition-colors ${activeFilter === 'watchlist' ? 'text-white font-semibold border-b-2 border-purple-500 pb-1' : 'text-gray-400 hover:text-white'}`}>
                <HeartIcon className="w-4 h-4 text-purple-400" />
                <span>My List</span>
                {watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-purple-600 text-[10px] text-white font-bold rounded-full shadow-sm shadow-purple-600/50">{watchlist.length}</span>
                )}
              </button>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isSearchOpen && (
              <button onClick={handleOpenSearch} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition" aria-label="Open search">
                <SearchIcon className="w-5 h-5" />
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-white/10 text-gray-200 hover:text-white md:hidden" aria-label="Toggle navigation menu">
              <MenuIcon className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600/25 to-indigo-600/25 border border-purple-500/40 rounded-full text-xs font-semibold text-purple-300">
              <FlameIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>VIP Access</span>
            </div>

            {/* User Avatar + dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-purple-500/40 hover:ring-purple-400 transition"
                title={username ? `Signed in as ${username}` : 'Sign in'}
              >
                {avatarLabel}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-10 w-64 bg-[#121622] border border-gray-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  {username ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                          {avatarLabel}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{username}</p>
                          <p className="text-[11px] text-purple-400">My List: {watchlist.length} titles</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition border border-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <p className="text-sm font-bold text-white">Sign In</p>
                      <p className="text-[11px] text-gray-400">Enter your name to save your list across sessions.</p>
                      <input
                        type="text"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && loginInput.trim()) { login(loginInput); setShowUserMenu(false); setLoginInput(''); } }}
                        placeholder="Your name (e.g. Alex)"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
                        autoFocus
                      />
                      <button
                        onClick={() => { if (loginInput.trim()) { login(loginInput); setShowUserMenu(false); setLoginInput(''); } }}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-purple-600/30"
                      >
                        Sign In & Load My List
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0e111a]/95 backdrop-blur-md border-b border-purple-900/30 px-6 py-4 space-y-3">
            {['all','movie','tv','watchlist'].map((f, i) => (
              <button key={f} onClick={() => { onFilterChange(f as any); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-between w-full text-left py-2 text-sm text-gray-300 font-medium hover:text-white">
                <span>{['Home','Movies','TV Series','My List'][i]}</span>
                {f === 'watchlist' && watchlist.length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-600 text-xs text-white font-bold rounded-full">{watchlist.length}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-[#121622] rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center px-4 py-3.5 border-b border-gray-800">
              <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input ref={searchInputRef} type="text" placeholder="Search movies, TV shows, actors, anime..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-base sm:text-lg" />
              <button onClick={handleCloseSearch} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
              {isSearching ? (
                <div className="text-center py-8 text-gray-400 text-sm">Searching Stitch Stream library...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div key={item.id} onClick={() => { onSelectMovie(item); handleCloseSearch(); }}
                    className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition">
                    <div className="relative w-12 h-16 flex-none rounded-lg overflow-hidden bg-gray-800">
                      <Image src={getImageUrl(item.poster_path, 'w500')} alt={item.title || item.name || 'Poster'} fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{item.title || item.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.overview}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                        <span className="text-yellow-400 font-bold">â˜… {item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
                        <span>â€¢</span>
                        <span className="capitalize">{item.media_type || 'Movie'}</span>
                        <span>â€¢</span>
                        <span>{(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-gray-400 text-sm">No titles found for &quot;{searchQuery}&quot;. Try &quot;Dune&quot;, &quot;Deadpool&quot;, or &quot;Arcane&quot;.</div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">Type a title name above to search across movies and TV series</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
