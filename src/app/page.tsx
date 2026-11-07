'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import {
  FALLBACK_MOVIES,
  getTrendingMedia,
  getLatestMovies,
  getPopularMovies,
  getTopRated,
  getPopularTV,
} from '@/lib/tmdb';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailModal } from '@/components/MovieDetailModal';
import { Footer } from '@/components/Footer';
import { useWatchlist } from '@/context/WatchlistContext';
import {
  FlameIcon,
  StarIcon,
  TvIcon,
  FilmIcon,
  SparklesIcon,
  HeartIcon,
} from '@/components/Icons';

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>(FALLBACK_MOVIES);
  const [latestMovies, setLatestMovies] = useState<Movie[]>(FALLBACK_MOVIES);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'watchlist'>('all');

  const { watchlist } = useWatchlist();

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingData, latestData, popMovies, topData, popTV] = await Promise.all([
          getTrendingMedia(),
          getLatestMovies(),
          getPopularMovies(),
          getTopRated(),
          getPopularTV(),
        ]);

        if (trendingData?.length) setTrending(trendingData);
        if (latestData?.length) setLatestMovies(latestData);
        if (popMovies?.length) setPopularMovies(popMovies);
        if (topData?.length) setTopRated(topData);
        if (popTV?.length) setPopularTV(popTV);
      } catch (e) {
        console.error('Error fetching streamixx media rows:', e);
      }
    }
    loadData();
  }, []);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Genre filtered rows
  const actionMovies = (popularMovies.length ? popularMovies : FALLBACK_MOVIES).filter(
    (m) => m.genre_ids?.includes(28) || m.genre_ids?.includes(12)
  );

  const sciFiMovies = (popularMovies.length ? popularMovies : FALLBACK_MOVIES).filter(
    (m) => m.genre_ids?.includes(878) || m.genre_ids?.includes(14)
  );

  const animeAndAnimation = (trending.length ? trending : FALLBACK_MOVIES).filter(
    (m) => m.genre_ids?.includes(16)
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col">
      {/* Sticky Navigation Bar */}
      <Navbar
        onSelectMovie={handleSelectMovie}
        onFilterChange={setFilter}
        activeFilter={filter}
      />

      {/* Main Content Area (padding bottom for mobile bottom navigation bar) */}
      <main className="flex-1 pb-24 md:pb-0">
        {filter === 'watchlist' ? (
          /* Watchlist View */
          <div className="pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-500">
                <HeartIcon className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  My Watchlist
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  {watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved to your personal library
                </p>
              </div>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-gray-400 text-lg">
                  Your list is currently empty.
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Browse movies or TV series and click the &quot;Add to List&quot; button to save them here for easy access.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Explore Trending Titles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                {watchlist.map((movie) => (
                  <div key={movie.id} className="flex justify-center">
                    <MovieCard movie={movie} onSelect={handleSelectMovie} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Browsing Rows */
          <>
            {/* Hero Featured Slider */}
            <HeroBanner
              featuredMovies={
                filter === 'movie'
                  ? latestMovies.length ? latestMovies : popularMovies
                  : filter === 'tv'
                  ? popularTV
                  : latestMovies.length ? latestMovies : trending
              }
              onSelectMovie={handleSelectMovie}
            />

            {/* Quick Filter Bar */}
            <div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto -mt-6 sm:-mt-10 relative z-20 mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition backdrop-blur-md ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                All Content
              </button>
              <button
                onClick={() => setFilter('movie')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition backdrop-blur-md ${
                  filter === 'movie'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilter('tv')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition backdrop-blur-md ${
                  filter === 'tv'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                TV Series
              </button>
            </div>

            {/* Content Rows */}
            <div className="space-y-6 pt-2 pb-12">
              {(filter === 'all' || filter === 'movie') && (
                <MovieRow
                  title="🔥 Latest 2026 Releases & In Theaters"
                  icon={<FlameIcon className="w-5 h-5 text-purple-500" />}
                  movies={latestMovies}
                  onSelectMovie={handleSelectMovie}
                  size="large"
                />
              )}

              {(filter === 'all' || filter === 'movie') && (
                <MovieRow
                  title="Trending Blockbusters"
                  icon={<SparklesIcon className="w-5 h-5 text-amber-400" />}
                  movies={trending}
                  onSelectMovie={handleSelectMovie}
                />
              )}

              {(filter === 'all' || filter === 'movie') && (
                <MovieRow
                  title="Top Rated Blockbusters"
                  icon={<StarIcon className="w-5 h-5" />}
                  movies={topRated.length ? topRated : FALLBACK_MOVIES}
                  onSelectMovie={handleSelectMovie}
                />
              )}

              {(filter === 'all' || filter === 'tv') && (
                <MovieRow
                  title="Popular TV Shows & Series"
                  icon={<TvIcon className="w-5 h-5" />}
                  movies={popularTV.length ? popularTV : FALLBACK_MOVIES.filter((m) => m.media_type === 'tv')}
                  onSelectMovie={handleSelectMovie}
                />
              )}

              {actionMovies.length > 0 && (
                <MovieRow
                  title="Action & High Octane Adventure"
                  icon={<FilmIcon className="w-5 h-5" />}
                  movies={actionMovies}
                  onSelectMovie={handleSelectMovie}
                />
              )}

              {sciFiMovies.length > 0 && (
                <MovieRow
                  title="Sci-Fi & Cyberpunk Worlds"
                  icon={<SparklesIcon className="w-5 h-5" />}
                  movies={sciFiMovies}
                  onSelectMovie={handleSelectMovie}
                />
              )}

              {animeAndAnimation.length > 0 && (
                <MovieRow
                  title="Animation & Anime Highlights"
                  icon={<SparklesIcon className="w-5 h-5 text-amber-400" />}
                  movies={animeAndAnimation}
                  onSelectMovie={handleSelectMovie}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Movie Details & Streaming Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectMovie={handleSelectMovie}
      />
    </div>
  );
}
