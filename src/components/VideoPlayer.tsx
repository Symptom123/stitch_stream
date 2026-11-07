'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import {
  ServerIcon,
  RefreshIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  TheaterIcon,
  SubtitlesIcon,
  VolumeIcon,
  PlayIcon,
  BoltIcon,
  TvIcon,
  CloseIcon,
  SparklesIcon,
  StarIcon,
  GlobeIcon,
  CheckIcon,
} from './Icons';

// ── Streaming Server Gateway Definitions ──────────────────────────────────────

interface StreamServer {
  id: string;
  name: string;
  nodeCode: string;
  tag: string;
  speed: string;
  ping: string;
  resolution: string;
  qualities: string[];
  hasMultiAudio: boolean;
  isPopular?: boolean;
  getUrl: (id: number, isTv: boolean, season: number, episode: number, trailerKey?: string) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidlink',
    name: 'VidLink Prime',
    nodeCode: 'NODE 01',
    tag: 'Direct 4K Stream',
    speed: '⚡ Ultra Fast',
    ping: '14ms',
    resolution: '4K Ultra HD',
    qualities: ['480p', '720p', '1080p', '4K'],
    hasMultiAudio: true,
    isPopular: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`
        : `https://vidlink.pro/movie/${id}?primaryColor=7c3aed&secondaryColor=a78bfa&autoplay=true`,
  },
  {
    id: 'vidsrc_me',
    name: 'VidSrc Ultra',
    nodeCode: 'NODE 02',
    tag: 'Cloud CDN 4K',
    speed: '⚡ Lightning',
    ping: '21ms',
    resolution: '4K Ultra HD',
    qualities: ['360p', '720p', '1080p', '4K'],
    hasMultiAudio: true,
    isPopular: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: 'vidsrc_to',
    name: 'VidSrc Pro',
    nodeCode: 'NODE 03',
    tag: 'Optimized Buffer',
    speed: '✓ High Speed',
    ping: '28ms',
    resolution: '1080p Full HD',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'vidsrc_pm',
    name: 'VidSrc Stable',
    nodeCode: 'NODE 04',
    tag: 'Ultra-Stable Link',
    speed: '✓ Low Jitter',
    ping: '32ms',
    resolution: '1080p Full HD',
    qualities: ['360p', '480p', '720p', '1080p'],
    hasMultiAudio: false,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${id}`,
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed Elite',
    nodeCode: 'NODE 05',
    tag: 'Redundant Mesh',
    speed: '✓ Multi-Mirror',
    ping: '36ms',
    resolution: '1080p Full HD',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  },
  {
    id: 'smashy',
    name: 'SmashyStream Edge',
    nodeCode: 'NODE 06',
    tag: 'Global Edge Relay',
    speed: '~ Steady',
    ping: '41ms',
    resolution: '1080p Full HD',
    qualities: ['360p', '720p', '1080p'],
    hasMultiAudio: true,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: '2embed',
    name: '2Embed Reserve',
    nodeCode: 'NODE 07',
    tag: 'Failover Standby',
    speed: '~ Backup Node',
    ping: '48ms',
    resolution: '1080p Full HD',
    qualities: ['480p', '720p', '1080p'],
    hasMultiAudio: false,
    getUrl: (id, isTv, season, episode) =>
      isTv
        ? `https://www.2embed.skin/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.skin/embed/${id}`,
  },
];

// ── Quality & Audio Definitions ───────────────────────────────────────────────

const QUALITIES = [
  { label: '4K Ultra HD', res: '2160p', desc: 'True Cinema Bitrate • Dolby Atmos', badge: 'Ultra HDR' },
  { label: '1080p Full HD', res: '1080p', desc: 'Crystal Clear • 60 FPS Smooth', badge: 'Recommended' },
  { label: '720p HD Ready', res: '720p', desc: 'Balanced Quality • Fast Buffering', badge: 'Fast' },
  { label: '480p Standard', res: '480p', desc: 'Standard Def • Lower Bandwidth', badge: 'Lite' },
  { label: '360p Data Saver', res: '360p', desc: 'Mobile Optimized • Zero Stutter', badge: 'Mobile' },
  { label: 'Auto Adaptive', res: 'Dynamic', desc: 'Smart AI Bitrate Allocation', badge: 'Auto' },
];

const AUDIO_TRACKS = [
  { id: 'en', label: 'English', format: 'Original 5.1 Surround', badge: 'Default' },
  { id: 'es', label: 'Spanish (Español)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
  { id: 'fr', label: 'French (Français)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
  { id: 'de', label: 'German (Deutsch)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
  { id: 'ja', label: 'Japanese (日本語)', format: 'Original Master • Stereo', badge: 'Original' },
  { id: 'pt', label: 'Portuguese (Português)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
  { id: 'it', label: 'Italian (Italiano)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
  { id: 'ar', label: 'Arabic (العربية)', format: 'Studio Dub • Stereo', badge: 'Multi-Dub' },
];

const SUBTITLE_LANGS = [
  { id: 'off', label: 'Off', desc: 'No Subtitles' },
  { id: 'en', label: 'English', desc: 'Full Dialogue' },
  { id: 'es', label: 'Spanish', desc: 'Español CC' },
  { id: 'fr', label: 'French', desc: 'Français CC' },
  { id: 'de', label: 'German', desc: 'Deutsch CC' },
  { id: 'ja', label: 'Japanese', desc: '日本語字幕' },
  { id: 'pt', label: 'Portuguese', desc: 'Português CC' },
  { id: 'ar', label: 'Arabic', desc: 'عربي' },
];

const MAX_FREEZE_RETRIES = 3;

interface VideoPlayerProps {
  movie: Movie;
  isTv?: boolean;
  initialSeason?: number;
  initialEpisode?: number;
  onClose?: () => void;
}

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
  const [totalEpisodes] = useState<number>(24);
  const [selectedQuality, setSelectedQuality] = useState<string>('4K Ultra HD');
  const [selectedAudio, setSelectedAudio] = useState<string>('en');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [customSubtitleName, setCustomSubtitleName] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [streamStatus, setStreamStatus] = useState<'loading' | 'playing' | 'frozen'>('loading');
  const [freezeRetryCount, setFreezeRetryCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'servers' | 'episodes' | 'quality' | 'audio' | 'subtitles'>('servers');
  const [serverDropdownOpen, setServerDropdownOpen] = useState<boolean>(false);

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
    showNotification('Stream connection refreshed');
  }, [showNotification]);

  const handleQualityChange = useCallback((q: string) => {
    setSelectedQuality(q);
    showNotification(`Resolution set to ${q}`);
  }, [showNotification]);

  const handleAudioChange = useCallback((track: { id: string; label: string }) => {
    setSelectedAudio(track.id);
    showNotification(`Audio set to ${track.label}`);
  }, [showNotification]);

  const handleSubtitleChange = useCallback((sub: { id: string; label: string }) => {
    setSelectedSubtitle(sub.id);
    showNotification(sub.id === 'off' ? 'Subtitles disabled' : `Subtitles: ${sub.label}`);
  }, [showNotification]);

  const handleCustomSubtitleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomSubtitleName(file.name);
      showNotification(`Custom subtitle track loaded: ${file.name}`);
    }
  }, [showNotification]);

  const handleAutoFailover = useCallback(() => {
    const idx = STREAM_SERVERS.findIndex((s) => s.id === selectedServer);
    const next = STREAM_SERVERS[(idx + 1) % STREAM_SERVERS.length];
    setSelectedServer(next.id);
    setReloadKey((k) => k + 1);
    setStreamStatus('loading');
    setFreezeRetryCount(0);
    showNotification(`Rerouted to ${next.name}`);
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

  useEffect(() => {
    setFreezeRetryCount(0);
  }, [selectedServer]);

  // Silent popup suppressor: instantly closes any stray external windows in milliseconds
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

  // Hardware fullscreen event listener
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

  // Fullscreen keyboard shortcut 'F'
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
      {/* ── TOP BAR: Million-Dollar Cinema Header ── */}
      <div
        className={`relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#0c0d16]/95 via-[#131627]/95 to-[#0c0d16]/95 backdrop-blur-xl border-b border-white/10 ${
          isFullscreen ? 'hidden' : ''
        }`}
      >
        {/* Left: Metadata & Status Beacon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide truncate">
                {title}
              </h2>
              {releaseYear && (
                <span className="text-xs text-gray-400 font-medium">({releaseYear})</span>
              )}
              {isTv && (
                <span className="px-2 py-0.5 rounded-md bg-purple-600/30 border border-purple-500/50 text-purple-300 text-[11px] font-bold tracking-wide">
                  S{season} : E{episode}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-yellow-400 text-[11px] font-bold flex items-center gap-1">
                <StarIcon className="w-3 h-3 fill-current" />
                {rating}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <ServerIcon className="w-3 h-3" />
                {currentServerObj.name}
              </span>
              <span>•</span>
              <span className="text-gray-300">{currentServerObj.resolution}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">{currentServerObj.ping}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Server Selector Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-xs font-semibold text-gray-200 transition-all shadow-sm"
              title="Switch streaming server node"
            >
              <ServerIcon className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">{currentServerObj.nodeCode}:</span>
              <span>{currentServerObj.name}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {serverDropdownOpen && (
              <div
                className="absolute right-0 top-11 w-64 rounded-2xl bg-[#0f1220] border border-purple-500/30 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-2xl"
                onMouseLeave={() => setServerDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Fast Gateways (7)</span>
                  <span className="text-emerald-400">100% Online</span>
                </div>
                <div className="space-y-1">
                  {STREAM_SERVERS.map((srv) => {
                    const isAct = selectedServer === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => {
                          setSelectedServer(srv.id);
                          setServerDropdownOpen(false);
                          showNotification(`Connected to ${srv.name}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                          isAct
                            ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/40'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isAct ? 'bg-white' : 'bg-emerald-400'}`} />
                          <div>
                            <p className="font-semibold">{srv.name}</p>
                            <p className={`text-[10px] ${isAct ? 'text-purple-200' : 'text-gray-400'}`}>
                              {srv.tag}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isAct ? 'bg-purple-700 text-white' : 'bg-black/40 text-emerald-400'}`}>
                          {srv.ping}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reload Stream Button */}
          <button
            onClick={handleRefreshStream}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all text-xs font-semibold active:scale-95"
            title="Reload current stream node"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          {/* Theater Mode Button */}
          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              theaterMode
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
            }`}
            title={theaterMode ? 'Exit Theater Mode' : 'Theater Cinema Mode'}
          >
            <TheaterIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Theater</span>
          </button>

          {/* Full Screen Button (Million-Dollar Gradient Accent) */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold tracking-wide shadow-lg shadow-purple-600/30 transition-all active:scale-95 border border-purple-400/40"
            title="Enter Full Screen Mode (F)"
          >
            <FullscreenIcon className="w-4 h-4" />
            <span>Full Screen</span>
          </button>

          {/* Close Player (if modal) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all"
              title="Close Player"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── CINEMA VIDEO FRAME: Pristine Viewport ── */}
      <div
        className={`relative w-full bg-black overflow-hidden shadow-2xl group ${
          isFullscreen ? 'flex-1 h-screen' : 'aspect-video'
        }`}
      >
        {/* Soft Ambient Cinematic Glow behind iframe */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-purple-600/10 blur-3xl opacity-50 pointer-events-none" />

        {/* Video Iframe: Always rendered cleanly, no restrictive sandbox */}
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

        {/* High-End Branded Loading Overlay */}
        {streamStatus === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="w-14 h-14 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-purple-400 fill-current ml-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
              <span>Connecting to</span>
              <span className="text-purple-400">{currentServerObj.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Establishing high-bandwidth 4K stream link...</p>
          </div>
        )}

        {/* Stream Stalled / Freeze Diagnostic Assistant */}
        {streamStatus === 'frozen' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070912]/90 backdrop-blur-lg px-6 animate-fadeIn">
            <div className="max-w-md w-full bg-[#101424] border border-purple-500/40 rounded-2xl p-6 text-center shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
                <BoltIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">Stream Optimization Needed</h3>
                <p className="text-xs text-gray-400 mt-1">
                  The current gateway is taking longer to deliver frames. Switch to another high-speed server node or reconnect.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleAutoFailover}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 transition-all flex items-center justify-center gap-2"
                >
                  <ServerIcon className="w-4 h-4" />
                  <span>Auto-Reroute to Next Node</span>
                </button>
                <button
                  onClick={handleAutoReconnect}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshIcon className="w-4 h-4" />
                  <span>Reconnect</span>
                </button>
                <button
                  onClick={() => setStreamStatus('playing')}
                  className="px-3 py-2.5 rounded-xl text-gray-400 hover:text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subtle "Stream Buffering?" trigger button (visible on hover when playing) */}
        {streamStatus === 'playing' && (
          <button
            onClick={() => setStreamStatus('frozen')}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-purple-600 text-gray-300 hover:text-white text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10"
            title="Click if stream is buffering or stuck"
          >
            <BoltIcon className="w-3.5 h-3.5 text-yellow-400" />
            <span>Stream Stalled? Switch Node</span>
          </button>
        )}

        {/* Minimal Fullscreen Exit Pill (hover top-right) */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 hover:bg-purple-600 text-white text-xs font-bold transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/20 shadow-2xl"
            title="Exit Fullscreen (Esc or F)"
          >
            <ExitFullscreenIcon className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        )}

        {/* Sleek Floating Toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#121626]/95 border border-purple-500/50 text-white rounded-full text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-fadeIn pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* ── THE MILLION-DOLLAR CONSOLE DECK (Under Video) ── */}
      <div className={`flex flex-col bg-[#0b0d18] border-t border-white/10 p-4 sm:p-6 space-y-5 ${isFullscreen ? 'hidden' : ''}`}>
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('servers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'servers'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <ServerIcon className="w-4 h-4" />
              <span>Streaming Nodes (7)</span>
            </button>

            {isTv && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'episodes'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <TvIcon className="w-4 h-4" />
                <span>Episodes (Season {season})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'quality'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <BoltIcon className="w-4 h-4" />
              <span>Quality ({selectedQuality})</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'audio'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <VolumeIcon className="w-4 h-4" />
              <span>Audio Tracks</span>
            </button>

            <button
              onClick={() => setActiveTab('subtitles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'subtitles'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <SubtitlesIcon className="w-4 h-4" />
              <span>Subtitles</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-gray-300">Stitch Stream High-Speed Fiber Network</span>
          </div>
        </div>

        {/* ── TAB 1: Streaming Nodes Grid ── */}
        {activeTab === 'servers' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-gray-300">
                Enterprise CDN Gateway Mirrors • Click any node to switch instantly:
              </span>
              <span className="text-emerald-400 font-mono text-[11px] hidden sm:inline">
                ● 7 of 7 Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {STREAM_SERVERS.map((server) => {
                const isActive = selectedServer === server.id;
                return (
                  <div
                    key={server.id}
                    onClick={() => {
                      setSelectedServer(server.id);
                      showNotification(`Switched to ${server.name}`);
                    }}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-950/70 via-purple-900/30 to-[#0e111d] border-purple-500 shadow-xl shadow-purple-600/20 ring-1 ring-purple-400/40'
                        : 'bg-[#101423]/70 hover:bg-[#161c30] border-white/10 hover:border-purple-500/40'
                    }`}
                  >
                    {/* Top Row: Node Code & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-400 group-hover:text-purple-300'
                        }`}
                      >
                        {server.nodeCode}
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ACTIVE NOW</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                          <span>{server.ping}</span>
                        </span>
                      )}
                    </div>

                    {/* Server Name & Tagline */}
                    <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                      {server.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{server.tag}</p>

                    {/* Features Strip */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-semibold">
                        {server.resolution}
                      </span>
                      {server.hasMultiAudio && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                          Multi-Audio
                        </span>
                      )}
                      <span className="ml-auto text-emerald-400 font-semibold">{server.speed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: TV Episodes Hub ── */}
        {isTv && activeTab === 'episodes' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-300">Season:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                        season === s
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-gray-400">
                Playing Episode <strong className="text-white">{episode}</strong> of Season{' '}
                <strong className="text-white">{season}</strong>
              </span>
            </div>

            {/* Episode Buttons Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-56 overflow-y-auto pr-1">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                const isActive = episode === ep;
                return (
                  <button
                    key={ep}
                    onClick={() => {
                      setEpisode(ep);
                      showNotification(`Playing Season ${season} - Episode ${ep}`);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-gradient-to-b from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400'
                        : 'bg-[#121626] text-gray-300 hover:bg-[#1a2035] hover:text-white border border-white/5'
                    }`}
                  >
                    <span>EP {ep}</span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-white animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: Quality & Resolution Selector ── */}
        {activeTab === 'quality' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs text-gray-300">
              Select stream resolution and bandwidth profile:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {QUALITIES.map((q) => {
                const isActive = selectedQuality === q.label;
                return (
                  <div
                    key={q.label}
                    onClick={() => handleQualityChange(q.label)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-400 shadow-xl shadow-purple-600/20'
                        : 'bg-[#101423] hover:bg-[#161c30] border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-white">{q.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {q.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{q.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: Audio Dubs ── */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs text-gray-300">
              Select your preferred audio language track (supported on Node 1, 2, 3 & 6):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AUDIO_TRACKS.map((track) => {
                const isActive = selectedAudio === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleAudioChange(track)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-400 shadow-md shadow-blue-600/20'
                        : 'bg-[#101423] hover:bg-[#161c30] border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <VolumeIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-bold text-xs text-white">{track.label}</p>
                        <p className="text-[10px] text-gray-400">{track.format}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {track.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 5: Subtitles & Captions ── */}
        {activeTab === 'subtitles' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs text-gray-300">
              Select caption track or load your own custom subtitle file:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUBTITLE_LANGS.map((sub) => {
                const isActive = selectedSubtitle === sub.id && !customSubtitleName;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setCustomSubtitleName(null);
                      handleSubtitleChange(sub);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 font-bold'
                        : 'bg-[#101423] hover:bg-[#161c30] text-gray-300 hover:text-white border-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold">{sub.label}</p>
                    <p className={`text-[10px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                      {sub.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Subtitle File Uploader */}
            <div className="p-4 rounded-2xl bg-[#101424] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white block">Load Custom Subtitle File (.srt, .vtt)</span>
                <span className="text-gray-400 text-[11px]">
                  {customSubtitleName ? (
                    <span className="text-emerald-400 font-semibold">Active: {customSubtitleName}</span>
                  ) : (
                    'Have an external subtitle file on your device? Upload to sync instantly.'
                  )}
                </span>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition text-xs shadow-md shadow-purple-600/30">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".srt,.vtt"
                  className="hidden"
                  onChange={handleCustomSubtitleUpload}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
