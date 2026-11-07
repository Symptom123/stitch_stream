'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

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

  // Convert vertical mouse wheel into smooth horizontal scroll when hovering over row
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If user is scrolling vertically with mouse wheel
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Only take over if row can scroll in that direction
        const canScroll =
          (e.deltaY > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 5) ||
          (e.deltaY < 0 && el.scrollLeft > 5);

        if (canScroll) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 1.2;
          checkScroll();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', checkScroll);
    };
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative space-y-3 px-4 sm:px-8 md:px-12 py-4 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
          {icon && <span className="text-purple-500">{icon}</span>}
          <span>{title}</span>
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium hover:text-purple-400 transition hidden sm:inline">
            {movies.length} Titles
          </span>
          {/* Top Quick Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-20 transition border border-white/5"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-20 transition border border-white/5"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Container with Large Side Navigation Buttons */}
      <div className="relative">
        {/* Left Scroll Overlay Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/80 hover:bg-purple-950/90 text-white flex items-center justify-center opacity-70 group-hover/row:opacity-100 transition-all backdrop-blur-sm rounded-r-xl border-r border-y border-white/10 shadow-2xl hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-6 h-6 text-purple-300" />
          </button>
        )}

        {/* Scrollable movies list: Smooth wheel, momentum scroll */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 cursor-grab active:cursor-grabbing"
          style={{ overscrollBehaviorX: 'contain' }}
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

        {/* Right Scroll Overlay Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/80 hover:bg-purple-950/90 text-white flex items-center justify-center opacity-70 group-hover/row:opacity-100 transition-all backdrop-blur-sm rounded-l-xl border-l border-y border-white/10 shadow-2xl hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-6 h-6 text-purple-300" />
          </button>
        )}
      </div>
    </div>
  );
}
