'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Movie } from '@/types/movie';
import {
  ServerIcon,
  RefreshIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  TheaterIcon,
  PlayIcon,
  BoltIcon,
  TvIcon,
  CloseIcon,
  StarIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from './Icons';
import { DownloadModal } from './DownloadModal';

// ── Streaming Server Gateways ──────────────────────────────────────────────────

interface StreamServer {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  ping: string;
  getUrl: (id: number, isTv: boolean, season: number, episode: number, trailerKey?: string) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidlink',
    name: 'Server 1: VidLink',
    shortName: 'VidLink 4K',
    tag: '4K Ultra HD',
    ping: '14ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`
        : `https://vidlink.pro/movie/${id}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`,
  },
  {
    id: 'vidsrc_me',
    name: 'Server 2: VidSrc.me',
    shortName: 'VidSrc Ultra',
    tag: '4K Multi-Audio',
    ping: '21ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: 'vidsrc_to',
    name: 'Server 3: VidSrc.to',
    shortName: 'VidSrc Pro',
    tag: '1080p Crystal',
    ping: '28ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 4: VidSrc.pm',
    shortName: 'VidSrc Stable',
    tag: '1080p Smooth',
    ping: '32ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${id}`,
  },
  {
    id: 'multiembed',
    name: 'Server 5: MultiEmbed',
    shortName: 'MultiEmbed',
    tag: 'Multi-Mirror',
    ping: '36ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  },
  {
    id: 'smashy',
    name: 'Server 6: SmashyStream',
    shortName: 'SmashyStream',
    tag: 'Multi-Dub',
    ping: '41ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: '2embed',
    name: 'Server 7: 2Embed',
    shortName: '2Embed Backup',
    tag: 'Backup Node',
    ping: '48ms',
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://www.2embed.skin/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.skin/embed/${id}`,
  },
];

const MAX_FREEZE_RETRIES = 3;

interface VideoPlayerProps {
  movie: Movie;
  isTv?: boolean;
  initialSeason?: number;
  initialEpisode?: number;
  onClose?: () => void;
  onScrollToDetails?: () => void;
}

export function VideoPlayer({
  movie,
  isTv = false,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onScrollToDetails,
}: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<string>(STREAM_SERVERS[0].id);
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [totalEpisodes] = useState<number>(24);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [streamStatus, setStreamStatus] = useState<'loading' | 'playing' | 'frozen'>('loading');
  const [freezeRetryCount, setFreezeRetryCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const episodesScrollRef = useRef<HTMLDivElement>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleRefreshStream = useCallback(() => {
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    showNotification('Stream connection refreshed');
  }, [showNotification]);

  const handleAutoFailover = useCallback(() => {
    const idx = STREAM_SERVERS.findIndex((s) => s.id === selectedServer);
    const next = STREAM_SERVERS[(idx + 1) % STREAM_SERVERS.length];
    setSelectedServer(next.id);
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    setFreezeRetryCount(0);
    showNotification(`Switched to ${next.name}`);
  }, [selectedServer, showNotification]);

  const handleAutoReconnect = useCallback(() => {
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    showNotification('Reconnecting stream...');
  }, [showNotification]);

  const handleFreezeRecovery = useCallback(() => {
    if (freezeRetryCount >= MAX_FREEZE_RETRIES) {
      handleAutoFailover();
    } else {
      setFreezeRetryCount((c) => c + 1);
      handleAutoReconnect();
    }
  }, [freezeRetryCount, handleAutoFailover, handleAutoReconnect]);

  const scrollEpisodes = (direction: 'left' | 'right') => {
    if (episodesScrollRef.current) {
      const scrollAmount = 280;
      episodesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Convert mouse wheel to horizontal scroll on episodes row
  useEffect(() => {
    const el = episodesScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isTv]);

  useEffect(() => {
    setFreezeRetryCount(0);
  }, [selectedServer]);

  // Silent popup suppressor
  useEffect(() => {
    const originalOpen = window.open;
    window.open = function (...args: Parameters<typeof window.open>) {
      const popup = originalOpen.apply(window, args);
      if (popup) {
        setTimeout(() => {
          try {
            popup.close();
          } catch (_) {}
        }, 50);
        return popup;
      }
      return null;
    };
    return () => {
      window.open = originalOpen;
    };
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut 'F'
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const el = playerContainerRef.current;
        if (el?.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any)?.webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const currentServerObj =
    STREAM_SERVERS.find((s) => s.id === selectedServer) || STREAM_SERVERS[0];

  const streamUrl = currentServerObj.getUrl(
    movie.id,
    isTv,
    season,
    episode,
    movie.trailer_key
  );

  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.2';

  return (
    <div
      ref={playerContainerRef}
      className={`flex flex-col w-full bg-[#07080e] text-white transition-all duration-300 font-sans ${
        isFullscreen
          ? 'fixed inset-0 z-[999999] h-screen w-screen p-0 m-0 bg-black'
          : theaterMode
          ? 'col-span-full shadow-2xl'
          : 'rounded-2xl overflow-hidden'
      }`}
    >
      {/* ── TOP HEADER: Clean Minimalist Cinema Bar ── */}
      <div
        className={`relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-[#0d0f18]/95 backdrop-blur-xl border-b border-white/10 ${
          isFullscreen ? 'hidden' : ''
        }`}
      >
        {/* Left: Title & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-none" />
          <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide truncate max-w-[180px] sm:max-w-md">
            {title}
          </h2>
          {releaseYear && (
            <span className="text-xs text-gray-400 hidden sm:inline">({releaseYear})</span>
          )}
          {isTv && (
            <span className="px-2 py-0.5 rounded bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex-none">
              S{season} : E{episode}
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-yellow-400 text-xs font-bold flex items-center gap-1 hidden md:flex">
            <StarIcon className="w-3 h-3 fill-current" />
            {rating}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Scroll to Details Button */}
          {onScrollToDetails && (
            <button
              onClick={onScrollToDetails}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all text-xs font-medium"
              title="Scroll to Movie Synopsis & Details"
            >
              <InfoIcon className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Details</span>
              <span>↓</span>
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 transition-all text-xs font-bold active:scale-95 shadow-sm shadow-purple-600/20"
            title="Download Movie for Offline Playback"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Reload Stream */}
          <button
            onClick={handleRefreshStream}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all text-xs font-semibold flex items-center gap-1"
            title="Reload Stream"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          {/* Theater Mode */}
          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
              theaterMode
                ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
            }`}
            title="Theater Mode"
          >
            <TheaterIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Theater</span>
          </button>

          {/* Full Screen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold tracking-wide shadow-md shadow-purple-600/30 transition-all active:scale-95 border border-purple-400/40"
            title="Full Screen (F)"
          >
            <FullscreenIcon className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
              title="Close"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── CINEMA VIDEO FRAME: Viewport-Constrained Sizing (Fits screen perfectly so no scroll fighting!) ── */}
      <div
        className={`relative w-full bg-black overflow-hidden shadow-2xl group ${
          isFullscreen ? 'flex-1 h-screen' : 'aspect-video max-h-[62vh] min-h-[260px]'
        }`}
      >
        <iframe
          ref={iframeRef}
          key={`${selectedServer}-${season}-${episode}-${reloadKey}`}
          src={streamUrl}
          title={title}
          className="w-full h-full border-0 absolute inset-0 z-10 bg-black"
          referrerPolicy="origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
          allowFullScreen
          onLoad={() => setStreamStatus('playing')}
        />

        {/* Loading Overlay */}
        {streamStatus === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none">
            <div className="relative w-14 h-14 mb-3 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <PlayIcon className="w-5 h-5 text-purple-400 fill-current ml-0.5 absolute" />
            </div>
            <p className="text-white font-bold text-sm">Connecting to {currentServerObj.name}...</p>
            <p className="text-xs text-gray-400 mt-0.5">Stream starting momentarily</p>
          </div>
        )}

        {/* Stalled / Buffer Helper */}
        {streamStatus === 'frozen' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md px-6 animate-fadeIn">
            <div className="max-w-sm w-full bg-[#101424] border border-purple-500/40 rounded-2xl p-5 text-center shadow-2xl space-y-3">
              <h3 className="text-base font-extrabold text-white">Stream Buffering?</h3>
              <p className="text-xs text-gray-400">Try auto-switching to the next fast server node or reconnect.</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAutoFailover}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Switch Server
                </button>
                <button
                  onClick={handleAutoReconnect}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition"
                >
                  Reconnect
                </button>
                <button
                  onClick={() => setStreamStatus('playing')}
                  className="py-2 px-3 rounded-xl text-gray-400 hover:text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subtle buffering helper on hover */}
        {streamStatus === 'playing' && (
          <button
            onClick={() => setStreamStatus('frozen')}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-purple-600 text-gray-300 hover:text-white text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10"
            title="Switch server if buffering"
          >
            <BoltIcon className="w-3.5 h-3.5 text-yellow-400" />
            <span>Buffering? Switch Server</span>
          </button>
        )}

        {/* Fullscreen Exit Pill */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 hover:bg-purple-600 text-white text-xs font-bold transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <ExitFullscreenIcon className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-[#121626]/95 border border-purple-500/50 text-white rounded-full text-xs font-semibold shadow-2xl backdrop-blur-xl animate-fadeIn pointer-events-none">
            {notification}
          </div>
        )}
      </div>

      {/* ── EASY-TO-USE CONTROLS: Flex-Wrap Server Pills ── */}
      <div className={`flex flex-col bg-[#0b0d18] border-t border-white/10 px-4 sm:px-6 py-3.5 space-y-3 ${isFullscreen ? 'hidden' : ''}`}>
        {/* Row 1: Flex-Wrapped Server Pills (All 7 servers visible at a glance) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase font-bold text-gray-400 whitespace-nowrap flex items-center gap-1.5 mr-1">
              <ServerIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Server:</span>
            </span>

            {STREAM_SERVERS.map((srv, idx) => {
              const isAct = selectedServer === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => {
                    setSelectedServer(srv.id);
                    showNotification(`Switched to ${srv.name}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isAct
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-white' : 'bg-emerald-400'}`} />
                  <span>Server {idx + 1}: {srv.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Offline Download Pill */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-purple-600/30 whitespace-nowrap self-start sm:self-auto active:scale-95 transition-all"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span>Download Movie</span>
          </button>
        </div>

        {/* Row 2: TV Episodes with Smooth Arrow Controls & Wheel Scroll */}
        {isTv && (
          <div className="pt-2.5 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-300">Season:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      season === s
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    S{s}
                  </button>
                ))}
              </div>

              {/* Navigation Arrows for Episodes */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 hidden sm:inline">Playing Ep {episode}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollEpisodes('left')}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                    title="Scroll Episodes Left"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => scrollEpisodes('right')}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                    title="Scroll Episodes Right"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Episodes List */}
            <div
              ref={episodesScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1"
            >
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                const isActive = episode === ep;
                return (
                  <button
                    key={ep}
                    onClick={() => {
                      setEpisode(ep);
                      showNotification(`Playing Season ${season} - Episode ${ep}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-none ${
                      isActive
                        ? 'bg-purple-600 text-white ring-1 ring-purple-400 shadow-sm'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    EP {ep}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Download Center Modal */}
      <DownloadModal
        movie={movie}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        isTv={isTv}
        season={season}
        episode={episode}
      />
    </div>
  );
}
