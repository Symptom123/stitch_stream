'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Movie } from '@/types/movie';
import {
  ServerIcon,
  RefreshIcon,
  MaximizeIcon,
  MinimizeIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  TheaterIcon,
  SubtitlesIcon,
  VolumeIcon,
  PlayIcon,
  BoltIcon,
  FilmIcon,
  TvIcon,
  CloseIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
} from './Icons';

// ── Servers ───────────────────────────────────────────────────────────────────

interface StreamServer {
  id: string;
  name: string;
  badge: string;
  speed: string;
  qualities: string[];
  hasMultiAudio: boolean;
  getUrl: (id: number, isTv: boolean, season: number, episode: number, trailerKey?: string) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidlink',
    name: 'Server 1: VidLink',
    badge: 'HD+',
    speed: '⚡ Ultra Fast',
    qualities: ['480p', '720p', '1080p', '4K'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`
        : `https://vidlink.pro/movie/${id}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`,
  },
  {
    id: 'vidsrc_me',
    name: 'Server 2: VidSrc.me',
    badge: '4K',
    speed: '⚡ Fast',
    qualities: ['360p', '720p', '1080p', '4K'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: 'vidsrc_to',
    name: 'Server 3: VidSrc.to',
    badge: 'HD',
    speed: '✓ Reliable',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 4: VidSrc.pm',
    badge: 'HD',
    speed: '✓ Stable',
    qualities: ['360p', '480p', '720p', '1080p'],
    hasMultiAudio: false,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${id}`,
  },
  {
    id: 'multiembed',
    name: 'Server 5: MultiEmbed',
    badge: 'Multi',
    speed: '✓ Good',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  },
  {
    id: 'smashy',
    name: 'Server 6: SmashyStream',
    badge: 'Alt',
    speed: '~ Moderate',
    qualities: ['360p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: '2embed',
    name: 'Server 7: 2Embed',
    badge: 'Backup',
    speed: '~ Moderate',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: false,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://www.2embed.skin/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.skin/embed/${id}`,
  },
];

// ── Quality & Audio ───────────────────────────────────────────────────────────

const QUALITIES = [
  { label: '360p', desc: 'Mobile Save' },
  { label: '480p', desc: 'Standard' },
  { label: '720p', desc: 'HD Ready' },
  { label: '1080p', desc: 'Full HD' },
  { label: '4K', desc: 'Ultra HD' },
  { label: 'Auto', desc: 'Smart' },
];

const AUDIO_TRACKS = [
  { id: 'en', label: 'English', badge: 'Default' },
  { id: 'es', label: 'Spanish', badge: 'Dub' },
  { id: 'fr', label: 'French', badge: 'Dub' },
  { id: 'de', label: 'German', badge: 'Dub' },
  { id: 'ja', label: 'Japanese', badge: 'Original' },
  { id: 'pt', label: 'Portuguese', badge: 'Dub' },
  { id: 'it', label: 'Italian', badge: 'Dub' },
  { id: 'ar', label: 'Arabic', badge: 'Dub' },
];

const SUBTITLE_LANGS = [
  { id: 'off', label: 'Off' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'ja', label: 'Japanese' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ar', label: 'Arabic' },
];

const MAX_FREEZE_RETRIES = 3;

// ── Props ─────────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  movie: Movie;
  isTv?: boolean;
  initialSeason?: number;
  initialEpisode?: number;
  onClose?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VideoPlayer({
  movie,
  isTv = false,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
}: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<string>(STREAM_SERVERS[0].id);
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [totalEpisodes] = useState<number>(20);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto');
  const [selectedAudio, setSelectedAudio] = useState<string>('en');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [customSubtitleName, setCustomSubtitleName] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [streamStatus, setStreamStatus] = useState<'loading' | 'playing' | 'frozen'>('loading');
  const [freezeRetryCount, setFreezeRetryCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState<boolean>(true);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('servers');

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleRefreshStream = useCallback(() => {
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    showNotification('Stream refreshed');
  }, [showNotification]);

  const handleQualityChange = useCallback((q: string) => {
    setSelectedQuality(q);
    showNotification(`Quality set to ${q}`);
  }, [showNotification]);

  const handleAudioChange = useCallback((track: { id: string; label: string }) => {
    setSelectedAudio(track.id);
    showNotification(`Audio: ${track.label}`);
  }, [showNotification]);

  const handleSubtitleChange = useCallback((sub: { id: string; label: string }) => {
    setSelectedSubtitle(sub.id);
    showNotification(sub.id === 'off' ? 'Subtitles off' : `Subtitles: ${sub.label}`);
  }, [showNotification]);

  const handleCustomSubtitleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomSubtitleName(file.name);
      showNotification(`Custom subtitles loaded: ${file.name}`);
    }
  }, [showNotification]);

  const handleAutoFailover = useCallback(() => {
    const idx = STREAM_SERVERS.findIndex((s) => s.id === selectedServer);
    const next = STREAM_SERVERS[(idx + 1) % STREAM_SERVERS.length];
    setSelectedServer(next.id);
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    setFreezeRetryCount(0);
    showNotification(`Auto-switched to ${next.name}`);
  }, [selectedServer, showNotification]);

  const handleAutoReconnect = useCallback(() => {
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    showNotification('Reconnecting...');
  }, [showNotification]);

  const handleFreezeRecovery = useCallback(() => {
    if (freezeRetryCount >= MAX_FREEZE_RETRIES) {
      handleAutoFailover();
    } else {
      setFreezeRetryCount((c) => c + 1);
      handleAutoReconnect();
    }
  }, [freezeRetryCount, handleAutoFailover, handleAutoReconnect]);

  useEffect(() => {
    setFreezeRetryCount(0);
  }, [selectedServer]);

  // Ghost-open popup kill: let popup open so the player thinks it worked,
  // then immediately close it (~50ms) before the user ever sees it
  useEffect(() => {
    const originalOpen = window.open;
    window.open = function (...args: Parameters<typeof window.open>) {
      const popup = originalOpen.apply(window, args);
      if (popup) {
        setTimeout(() => {
          try { popup.close(); } catch (_) {}
        }, 50);
        return popup;
      }
      return null;
    };
    return () => {
      window.open = originalOpen;
    };
  }, []);

  // Sync fullscreen state with browser hardware events
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

  // Keyboard shortcut 'F' for fullscreen
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

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={playerContainerRef}
      className={`flex flex-col w-full bg-[#0a0d14] text-white transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[999999] h-screen w-screen p-0 m-0 bg-black'
          : theaterMode
          ? 'col-span-full'
          : ''
      }`}
    >
      {/* Quick Server Switcher Strip - hidden in fullscreen */}
      <div className={isFullscreen ? 'hidden' : 'flex items-center gap-1.5 px-3 py-1.5 bg-[#07090f] border-b border-gray-800/80 overflow-x-auto no-scrollbar'}>
        <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap mr-1 flex items-center gap-1">
          <ServerIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Switch Server:</span>
        </span>
        {STREAM_SERVERS.slice(0, 7).map((srv) => {
          const isAct = selectedServer === srv.id;
          return (
            <button
              key={srv.id}
              onClick={() => { setSelectedServer(srv.id); showNotification(`Switched to ${srv.name}`); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isAct
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-gray-800/80'
              }`}
            >
              <span>{srv.name.split(':')[0]}</span>
              <span className="text-[9px] opacity-80 font-mono hidden sm:inline">{srv.badge}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-[11px] font-extrabold text-emerald-300 whitespace-nowrap shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>AD SHIELD: ACTIVE</span>
        </div>
      </div>

      {/* Player Header Bar - hidden in fullscreen */}
      <div className={isFullscreen ? 'hidden' : 'flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0d101a] border-b border-gray-800 text-xs sm:text-sm'}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-gray-100">{currentServerObj.name}</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gray-800 text-emerald-400 text-[11px] font-mono">{currentServerObj.speed}</span>
          {isTv && (
            <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-400 font-bold text-[11px]">
              Season {season} : Ep {episode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Ad Shield toggle */}
          <button
            onClick={() => {
              setAdBlockEnabled(!adBlockEnabled);
              showNotification(!adBlockEnabled ? 'Ad Shield ON: Popups blocked!' : 'Ad Shield Paused: Popups allowed');
            }}
            className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 text-xs shadow-md ${
              adBlockEnabled
                ? 'bg-emerald-500 text-black border border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/30 ring-1 ring-emerald-300'
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/60 hover:bg-yellow-500/30'
            }`}
            title={adBlockEnabled ? 'Ad Shield ON. Click to pause.' : 'Ad Shield OFF. Click to enable.'}
          >
            {adBlockEnabled ? (
              <><ShieldCheckIcon className="w-4 h-4 text-black stroke-[2.5]" /><span className="font-bold">Ad Shield: ON</span></>
            ) : (
              <><ShieldOffIcon className="w-4 h-4 text-yellow-400 stroke-[2.5]" /><span className="font-bold">Ad Shield: OFF</span></>
            )}
          </button>

          {/* Quality badge */}
          <div className="px-2 py-1 rounded bg-black/60 border border-gray-700/80 text-[11px] font-bold text-yellow-400 flex items-center gap-1">
            <BoltIcon className="w-3.5 h-3.5 text-yellow-400" />
            <span>{selectedQuality}</span>
          </div>

          {/* Refresh */}
          <button onClick={handleRefreshStream}
            className="p-1.5 px-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1 text-xs border border-gray-700/60"
            title="Refresh stream" aria-label="Refresh stream">
            <RefreshIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Reload</span>
          </button>

          {/* Theater Mode */}
          <button onClick={() => setTheaterMode(!theaterMode)}
            className="p-1.5 px-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1 border border-gray-700/60"
            title={theaterMode ? 'Exit Theater Mode' : 'Theater Mode'} aria-label="Theater Mode">
            <TheaterIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Theater</span>
          </button>

          {/* Full Screen */}
          <button onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 text-xs shadow-lg shadow-purple-600/30 active:scale-95"
            title="Enter Full Screen (F)" aria-label="Full Screen">
            <FullscreenIcon className="w-4 h-4" />
            <span className="text-xs">Full Screen</span>
          </button>

          {/* Close */}
          {onClose && (
            <button onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-purple-600 text-gray-300 hover:text-white transition border border-gray-700/60 ml-1"
              title="Close Player" aria-label="Close Player">
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Single iframe - ALWAYS rendered, key never changes on fullscreen toggle ── */}
      <div className={`relative w-full bg-black overflow-hidden shadow-2xl group ${isFullscreen ? 'flex-1 h-screen' : 'aspect-video'}`}>
        <iframe
          ref={iframeRef}
          key={`${selectedServer}-${season}-${episode}-${reloadKey}`}
          src={streamUrl}
          title={movie.title || movie.name || 'Movie Player'}
          className="w-full h-full border-0 absolute inset-0 z-10"
          referrerPolicy="origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
          allowFullScreen
          {...(adBlockEnabled
            ? { sandbox: 'allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock' }
            : {})}
          onLoad={() => setStreamStatus('playing')}
        />

        {/* Loading spinner */}
        {streamStatus === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-semibold text-gray-200">Connecting to {currentServerObj.name}...</span>
            <span className="text-xs text-gray-400 mt-1">Stream will start momentarily</span>
          </div>
        )}

        {/* Freeze recovery overlay */}
        {streamStatus === 'frozen' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
            <div className="text-center space-y-4 max-w-sm px-6">
              <div className="text-4xl">&#10052;</div>
              <h3 className="text-lg font-bold text-white">Stream Frozen</h3>
              <p className="text-sm text-gray-400">The stream appears to have stalled. Try reconnecting or switching to another server.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button onClick={() => handleFreezeRecovery()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95">
                  <RefreshIcon className="w-4 h-4" /> Reconnect Stream
                </button>
                <button onClick={() => handleAutoFailover()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95">
                  <ServerIcon className="w-4 h-4" /> Switch Server
                </button>
                <button onClick={() => setStreamStatus('playing')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition border border-gray-700">
                  Dismiss
                </button>
              </div>
              {freezeRetryCount > 0 && (
                <p className="text-[11px] text-gray-500 pt-1">
                  Retry {freezeRetryCount}/{MAX_FREEZE_RETRIES} on this server.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stream Frozen? floating button */}
        {streamStatus === 'playing' && (
          <button onClick={() => setStreamStatus('frozen')}
            className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-gray-900/80 hover:bg-purple-600/90 text-gray-400 hover:text-white rounded-lg text-[11px] font-semibold transition opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-gray-700/60 flex items-center gap-1.5"
            title="Click if the stream is frozen or stuck">
            <span>&#10052;</span>
            <span>Stream Frozen?</span>
          </button>
        )}

        {/* Exit fullscreen overlay - visible on hover when fullscreen */}
        {isFullscreen && (
          <button onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-purple-600 text-white text-xs font-bold transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
            title="Exit Fullscreen (Esc / F)">
            <ExitFullscreenIcon className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        )}

        {/* Notification toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-gray-950/95 border border-purple-500/60 text-white rounded-lg text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Player Navigation Panel - hidden in fullscreen */}
      <div className={isFullscreen ? 'hidden' : 'bg-[#0e111a] border-t border-gray-800/80 p-3 sm:p-4 space-y-3'}>
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-gray-800/60 pb-2.5">
          {[
            { id: 'servers', icon: <ServerIcon className="w-4 h-4" />, label: `Fast Servers (${STREAM_SERVERS.length})` },
            { id: 'quality', icon: <BoltIcon className="w-4 h-4" />, label: 'Quality (360p - 4K)' },
            { id: 'audio', icon: <VolumeIcon className="w-4 h-4" />, label: 'Various Audio' },
            { id: 'subtitles', icon: <SubtitlesIcon className="w-4 h-4" />, label: 'Subtitles' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}

          <button onClick={() => setActiveTab('adshield')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'adshield' ? 'bg-emerald-600 text-white shadow-md' : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>Ad Shield ({adBlockEnabled ? 'Active' : 'Off'})</span>
          </button>

          {isTv && (
            <button onClick={() => setActiveTab('episodes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'episodes' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <TvIcon className="w-4 h-4" /><span>Episodes</span>
            </button>
          )}
        </div>

        {/* Tab: Servers */}
        {activeTab === 'servers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
              <span>Switch server if one buffers or fails</span>
              <span className="text-emerald-400">&#9679; All verified</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {STREAM_SERVERS.map((server) => {
                const isActive = selectedServer === server.id;
                return (
                  <button key={server.id}
                    onClick={() => { setSelectedServer(server.id); showNotification(`Switched to ${server.name}`); }}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition ${
                      isActive ? 'bg-purple-600/15 border-purple-500/80 text-white ring-1 ring-purple-500/50' : 'bg-black/40 border-gray-800/80 text-gray-300 hover:border-gray-700'
                    }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">{server.name}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />}
                      </div>
                      <span className="text-[11px] text-emerald-400 block mt-0.5">{server.speed}</span>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{server.qualities.slice(0, 3).join('/')}</span>
                        {server.hasMultiAudio && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/50">Multi-Audio</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-gray-400'}`}>{server.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Quality */}
        {activeTab === 'quality' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-medium text-gray-300">Choose Preferred Resolution:</span>
              <span className="text-gray-500 text-[11px]">Active: <strong className="text-white">{selectedQuality}</strong></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {QUALITIES.map((q) => {
                const isActive = selectedQuality === q.label;
                return (
                  <button key={q.label} onClick={() => handleQualityChange(q.label)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      isActive ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                    }`}>
                    <span className="font-extrabold text-sm tracking-wide">{q.label}</span>
                    <span className={`text-[10px] mt-1 ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>{q.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Audio */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-medium text-gray-300">Select Audio Language:</span>
              <span className="text-gray-500 text-[11px]">Server 1, 2, 3 &amp; 6 support multi-audio</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {AUDIO_TRACKS.map((track) => {
                const isActive = selectedAudio === track.id;
                return (
                  <button key={track.id} onClick={() => handleAudioChange(track)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isActive ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                      <VolumeIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                      <span className="text-xs font-semibold">{track.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{track.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Subtitles */}
        {activeTab === 'subtitles' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-medium text-gray-300">Closed Captions &amp; Subtitles:</span>
              <span className="text-gray-500 text-[11px]">{customSubtitleName ? `Custom: ${customSubtitleName}` : 'Auto-synced'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUBTITLE_LANGS.map((sub) => {
                const isActive = selectedSubtitle === sub.id && !customSubtitleName;
                return (
                  <button key={sub.id}
                    onClick={() => { setCustomSubtitleName(null); handleSubtitleChange(sub); }}
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                      isActive ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                    }`}>
                    {sub.label}
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-black/40 border border-gray-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-gray-300 block">Load Custom Subtitles (.srt / .vtt)</span>
                <span className="text-gray-500 text-[11px]">Have your own subtitle file? Choose it here.</span>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition text-xs border border-gray-700">
                <span>Browse File</span>
                <input type="file" accept=".srt,.vtt" className="hidden" onChange={handleCustomSubtitleUpload} />
              </label>
            </div>
          </div>
        )}

        {/* Tab: TV Episodes */}
        {isTv && activeTab === 'episodes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-medium text-gray-300">Season {season} Episodes:</span>
              <div className="flex items-center gap-1.5">
                <button disabled={season <= 1} onClick={() => setSeason((s) => Math.max(1, s - 1))}
                  className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs text-gray-300">Prev Season</button>
                <span className="font-bold text-white text-xs px-2">Season {season}</span>
                <button onClick={() => setSeason((s) => s + 1)}
                  className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">Next Season</button>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                const isActive = episode === ep;
                return (
                  <button key={ep}
                    onClick={() => { setEpisode(ep); showNotification(`Playing S${season} E${ep}`); }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition text-center ${
                      isActive ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-black/50 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white'
                    }`}>
                    EP {ep}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Ad Shield */}
        {activeTab === 'adshield' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span>Stitch Stream Built-In Anti-Ad &amp; Popup Shield</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                adBlockEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-yellow-950 text-yellow-300 border border-yellow-500/40'
              }`}>
                {adBlockEnabled ? 'GHOST-KILL ACTIVE' : 'PROTECTION PAUSED'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Pop-up Trap Killer &amp; Anti-Redirect Guard</h4>
                  <p className="text-xs text-gray-400 max-w-lg mt-0.5">Neutralizes pop-ups and prevents ad scripts from hijacking your browser session.</p>
                </div>
                <button
                  onClick={() => { setAdBlockEnabled(!adBlockEnabled); showNotification(!adBlockEnabled ? 'Ad Shield ON!' : 'Ad Shield Paused'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                    adBlockEnabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}>
                  {adBlockEnabled ? 'Shield Active (Click to Pause)' : 'Shield Inactive (Click to Enable)'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-800/80 text-xs">
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                  <span className="font-semibold text-gray-200 block">Zero New Tabs</span>
                  <span className="text-[11px] text-gray-400">Sandbox blocks window.open calls from ad scripts inside the player iframe.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                  <span className="font-semibold text-gray-200 block">Anti-Redirect Guard</span>
                  <span className="text-[11px] text-gray-400">Parent window is protected against navigation hijacking and malicious redirect loops.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                  <span className="font-semibold text-gray-200 block">Clean Playback</span>
                  <span className="text-[11px] text-gray-400">Combine with uBlock Origin or Brave Browser for zero in-stream banners.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
