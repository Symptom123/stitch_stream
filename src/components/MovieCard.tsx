'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { getImageUrl, FALLBACK_POSTER } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { PlayIcon, StarIcon, PlusIcon, CheckIcon } from './Icons';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  size?: 'normal' | 'large';
}

export function MovieCard({ movie, onSelect, size = 'normal' }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const [imgSrc, setImgSrc] = useState(getImageUrl(movie.poster_path, 'w500'));

  useEffect(() => {
    setImgSrc(getImageUrl(movie.poster_path, 'w500'));
  }, [movie.poster_path]);

  return (
    <div
      onClick={() => onSelect(movie)}
      className={`group relative flex-none cursor-pointer select-none rounded-xl overflow-hidden bg-[#121622] transition-all duration-300 hover:scale-105 active:scale-95 hover:z-20 hover:shadow-2xl hover:shadow-purple-950/40 border border-gray-800/80 hover:border-purple-600/60 snap-start ${
        size === 'large' ? 'w-44 sm:w-56' : 'w-32 sm:w-44 md:w-48'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <Image
          src={imgSrc}
          alt={title}
          fill
          unoptimized
          sizes="(max-width: 768px) 150px, 200px"
          onError={() => setImgSrc(FALLBACK_POSTER)}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Quality Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-purple-600/90 text-white shadow-sm backdrop-blur-xs">
            {movie.quality || '4K'}
          </span>
        </div>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-yellow-400 text-[11px] font-bold">
            <StarIcon className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(movie);
              }}
              className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/40 transform transition active:scale-95"
              aria-label="Play"
            >
              <PlayIcon className="w-4 h-4 fill-current ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie);
              }}
              className={`p-2.5 rounded-full border transition active:scale-95 ${
                inWatchlist
                  ? 'bg-purple-600/90 border-purple-400 text-white'
                  : 'bg-black/60 border-white/30 text-white hover:bg-white/20'
              }`}
              aria-label={inWatchlist ? 'Remove from list' : 'Add to list'}
            >
              {inWatchlist ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-gray-300 line-clamp-2 leading-tight">
            {movie.overview}
          </p>
        </div>
      </div>

      {/* Title & Metadata footer */}
      <div className="p-2.5">
        <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-purple-400 transition-colors">
          {title}
        </h4>
        <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
          <span>{releaseYear || '2024'}</span>
          <span className="capitalize">{movie.media_type === 'tv' ? 'TV' : 'Movie'}</span>
        </div>
      </div>
    </div>
  );
}
