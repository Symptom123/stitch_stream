'use client';

import React, { useRef } from 'react';
import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
  onSelectMovie: (movie: Movie) => void;
  size?: 'normal' | 'large';
}

export function MovieRow({
  title,
  movies,
  icon,
  onSelectMovie,
  size = 'normal',
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative space-y-3 px-4 sm:px-8 md:px-12 py-4 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
          {icon && <span className="text-purple-500">{icon}</span>}
          <span>{title}</span>
        </h3>
        <span className="text-xs text-gray-500 font-medium hover:text-purple-400 cursor-pointer transition">
          {movies.length} Titles
        </span>
      </div>

      {/* Row Container with Navigation Buttons */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-xs rounded-r-lg"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* Scrollable movies list */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              size={size}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-xs rounded-l-lg"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
