export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  trailer_key?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  quality?: '4K' | 'HD' | 'CAM';
}

export interface Genre {
  id: number;
  name: string;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}
