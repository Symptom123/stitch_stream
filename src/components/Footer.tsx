import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full bg-[#07080c] border-t border-gray-900 text-gray-400 text-xs py-12 px-4 sm:px-8 md:px-12 mt-16 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/05_app_icon.svg" alt="Stitch Stream" width={32} height={32} unoptimized />
            </div>
            <span className="text-lg font-black tracking-wider text-white">
              STITCH <span className="text-purple-400">STREAM</span>
            </span>
          </div>
          <p className="max-w-xl text-gray-500 text-xs">
            Stitch Stream is a next-generation streaming discovery platform powered by TMDB metadata.
            Watch official trailers, discover trending releases, and curate your personal watchlist.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2.5">
            <h5 className="font-bold text-gray-200">Navigation</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition">Trending Movies</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Popular TV Series</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Top Rated Classics</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Upcoming 2025/2026</a></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h5 className="font-bold text-gray-200">Genres</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition">Action & Adventure</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Sci-Fi & Cyberpunk</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Anime & Animation</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Drama & Crime</a></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h5 className="font-bold text-gray-200">Quality & Tech</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition">4K Ultra HD</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Dolby Atmos Audio</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Fast Cloud CDN</a></li>
              <li><a href="#" className="hover:text-purple-400 transition">Multi-Device Sync</a></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h5 className="font-bold text-gray-200">Attribution</h5>
            <p className="text-gray-500 leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB. All movie posters and backdrops belong to their respective copyright holders.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-900 text-center text-gray-600 text-[11px]">
          &copy; 2026 Stitch Stream Media Network. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
