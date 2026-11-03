'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { getImageUrl, FALLBACK_BACKDROP } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { PlayIcon, InfoIcon, PlusIcon, CheckIcon, StarIcon } from './Icons';

interface HeroBannerProps {
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export function HeroBanner({ featuredMovies, onSelectMovie }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const movies = featuredMovies.slice(0, 5);
  const currentMovie = movies[currentIndex] || movies[0];
  const [backdropSrc, setBackdropSrc] = useState<string>('');

  useEffect(() => {
    if (currentMovie) {
      setBackdropSrc(getImageUrl(currentMovie.backdrop_path || currentMovie.poster_path, 'original'));
    }
  }, [currentMovie]);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!currentMovie) return null;

  const inWatchlist = isInWatchlist(currentMovie.id);
  const title = currentMovie.title || currentMovie.name || 'Featured Title';
  const releaseYear = (currentMovie.release_date || currentMovie.first_air_date || '').split('-')[0];
  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : '8.4';

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[88vh] overflow-hidden select-none bg-black">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          key={currentMovie.id}
          src={backdropSrc || FALLBACK_BACKDROP}
          alt={title}
          fill
          priority
          unoptimized
          onError={() => setBackdropSrc(FALLBACK_BACKDROP)}
          className="object-cover object-top opacity-80 sm:opacity-90 transition-opacity duration-1000 transform scale-100"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Metadata pill badge */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 text-xs font-black rounded bg-purple-600 text-white tracking-widest shadow-md">
              STITCH STREAM SPOTLIGHT
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
              <StarIcon className="w-3.5 h-3.5 fill-current" />
              <span>{rating}</span>
            </div>
            {releaseYear && (
              <span className="text-xs text-gray-300 font-semibold bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs">
                {releaseYear}
              </span>
            )}
            <span className="text-xs font-bold text-gray-400 border border-gray-700 px-1.5 py-0.2 rounded">
              4K ULTRA HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl text-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectMovie(currentMovie)}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xl hover:shadow-purple-600/40 transition duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlayIcon className="w-5 h-5 fill-current" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onSelectMovie(currentMovie)}
              className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold backdrop-blur-md transition border border-white/15"
            >
              <InfoIcon className="w-5 h-5" />
              <span>More Info</span>
            </button>

            <button
              onClick={() =>
                inWatchlist ? removeFromWatchlist(currentMovie.id) : addToWatchlist(currentMovie)
              }
              className={`p-3 rounded-xl border transition backdrop-blur-md ${
                inWatchlist
                  ? 'bg-purple-600/90 border-purple-400 text-white'
                  : 'bg-black/50 border-white/20 text-white hover:bg-white/20'
              }`}
              title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            >
              {inWatchlist ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Carousel indicator thumbnails / dots */}
        <div className="flex items-center gap-2 pt-8">
          {movies.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-purple-600 shadow-md shadow-purple-600/50'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
