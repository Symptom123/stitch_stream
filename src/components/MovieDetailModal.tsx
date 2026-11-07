'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { getImageUrl, FALLBACK_BACKDROP } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { VideoPlayer } from './VideoPlayer';
import { DownloadModal } from './DownloadModal';
import {
  CloseIcon,
  PlayIcon,
  PlusIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
  FilmIcon,
  TvIcon,
  BoltIcon,
  DownloadIcon,
} from './Icons';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

export function MovieDetailModal({
  movie,
  isOpen,
  onClose,
  onSelectMovie,
}: MovieDetailModalProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backdropSrc, setBackdropSrc] = useState<string>('');

  useEffect(() => {
    if (movie) {
      setBackdropSrc(getImageUrl(movie.backdrop_path || movie.poster_path, 'original'));
      setIsPlaying(false);
      setShowDownloadModal(false);
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const inWatchlist = isInWatchlist(movie.id);
  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.1';
  const isTv = movie.media_type === 'tv' || Boolean(movie.first_air_date && !movie.release_date);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn"
        onClick={onClose}
      >
        <div
          className={`relative w-full ${
            isPlaying ? 'max-w-6xl' : 'max-w-4xl'
          } bg-[#0e111a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl my-auto text-white transition-all duration-300 transform`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button (shown when not playing) */}
          {!isPlaying && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-white/10"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}

          {/* Video Player or Cinematic Backdrop */}
          {isPlaying ? (
            <VideoPlayer movie={movie} onClose={onClose} isTv={isTv} />
          ) : (
            <div className="relative aspect-video w-full bg-black overflow-hidden group">
              <Image
                src={backdropSrc || FALLBACK_BACKDROP}
                alt={title}
                fill
                unoptimized
                onError={() => setBackdropSrc(FALLBACK_BACKDROP)}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e111a] via-[#0e111a]/40 to-transparent" />

              {/* Play Button Center Trigger */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="p-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-2xl shadow-purple-600/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center pl-7 group/btn"
                  aria-label="Play Now"
                >
                  <PlayIcon className="w-12 h-12 fill-current group-hover/btn:scale-105" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  Stream in Ultra HD • Multi-Server Fast Playback
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-purple-600 text-white tracking-wider flex items-center gap-1">
                    <BoltIcon className="w-3 h-3" />
                    {movie.quality || '4K ULTRA HD'}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/20 backdrop-blur-sm text-gray-200 flex items-center gap-1">
                    {isTv ? <TvIcon className="w-3 h-3" /> : <FilmIcon className="w-3 h-3" />}
                    {isTv ? 'TV SERIES' : 'MOVIE'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                  {title}
                </h2>
              </div>
            </div>
          )}

          {/* Modal Info & Synopsis */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition active:scale-95 text-sm sm:text-base"
                >
                  <PlayIcon className="w-5 h-5 fill-current" />
                  <span>{isPlaying ? 'Overview Mode' : 'Watch Now'}</span>
                </button>

                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600/25 to-indigo-600/25 hover:from-purple-600 hover:to-indigo-600 text-purple-300 hover:text-white rounded-xl font-bold border border-purple-500/40 shadow-sm transition active:scale-95 text-sm sm:text-base"
                >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() =>
                    inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition active:scale-95 text-sm sm:text-base border ${
                    inWatchlist
                      ? 'bg-purple-600/90 border-purple-400 text-white hover:bg-purple-600'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>In My List</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      <span>Add to List</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-sm font-medium transition"
                >
                  {copied ? 'Copied Link!' : 'Share'}
                </button>
              </div>

              {/* Rating & Metadata Badges */}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-md border border-yellow-400/20">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span>{rating}</span>
                  <span className="text-gray-400 text-xs font-normal">/ 10</span>
                </div>
                {releaseYear && <span className="font-semibold text-gray-300">{releaseYear}</span>}
                <span className="px-2 py-0.5 rounded border border-gray-700 text-xs font-bold text-gray-400">
                  PG-13
                </span>
              </div>
            </div>

            {/* Overview & Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                Storyline
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {movie.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs text-gray-400 border-t border-gray-800">
              <div>
                <span className="block text-gray-500 font-medium">Original Title</span>
                <span className="text-gray-200 font-semibold">{title}</span>
              </div>
              <div>
                <span className="block text-gray-500 font-medium">Type</span>
                <span className="text-gray-200 font-semibold capitalize">
                  {isTv ? 'TV Series' : 'Movie'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 font-medium">Offline Quality</span>
                <span className="text-gray-200 font-semibold">4K UHD, 1080p, 720p</span>
              </div>
              <div>
                <span className="block text-gray-500 font-medium">Streaming Speed</span>
                <span className="text-emerald-400 font-semibold">7 Dedicated Fast Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Download Modal */}
      <DownloadModal
        movie={movie}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        isTv={isTv}
      />
    </>
  );
}
