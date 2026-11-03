import { Movie } from '@/types/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const DEFAULT_TMDB_API_KEY = '844dba0bfd8f3a4f3799f6130ef9e335';

export const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
export const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&auto=format&fit=crop';

export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'original' = 'w500') => {
  if (!path) return size === 'original' ? FALLBACK_BACKDROP : FALLBACK_POSTER;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const FALLBACK_MOVIES: Movie[] = [
  {
    id: 791523,
    title: "Wildwood",
    overview: "After her baby brother is abducted by a murder of crows, headstrong teenager Prue McKeel launches a desperate rescue mission into the Impassable Wilderness, an enchanted forest hidden just beyond Portland.",
    poster_path: "/8g7q6o54WfKWRmUQ0Ye8OskevUY.jpg",
    backdrop_path: "/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
    vote_average: 8.6,
    vote_count: 160,
    release_date: "2026-10-19",
    media_type: "movie",
    genre_ids: [16, 12, 14],
    quality: "4K",
  },
  {
    id: 1507696,
    title: "Apocalypse Z: New World",
    overview: "The Canary Islands have become Europe's last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland, a desperate race for survival begins.",
    poster_path: "/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
    backdrop_path: "/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
    vote_average: 6.8,
    vote_count: 85,
    release_date: "2026-10-09",
    media_type: "movie",
    genre_ids: [28, 53, 27],
    quality: "4K",
  },
  {
    id: 1101412,
    title: "Fall 2: Deadpoint",
    overview: "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights turn every moment into a fight for survival.",
    poster_path: "/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
    backdrop_path: "/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
    vote_average: 7.4,
    vote_count: 740,
    release_date: "2026-09-01",
    media_type: "movie",
    genre_ids: [53, 28],
    quality: "4K",
  },
  {
    id: 1204680,
    title: "Coyote vs. Acme",
    overview: "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
    poster_path: "/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
    backdrop_path: "/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
    vote_average: 8.2,
    vote_count: 1310,
    release_date: "2026-08-20",
    media_type: "movie",
    genre_ids: [35, 12, 16],
    quality: "4K",
  },
  {
    id: 945961,
    title: "Alien: Romulus",
    overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.",
    poster_path: "/b33nnKl1GSFbao8l3urDDur0YGG.jpg",
    backdrop_path: "/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
    vote_average: 7.3,
    vote_count: 2400,
    release_date: "2024-08-16",
    media_type: "movie",
    genre_ids: [27, 878],
    quality: "4K",
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520098.jpg",
    vote_average: 8.3,
    vote_count: 5120,
    release_date: "2024-03-01",
    media_type: "movie",
    genre_ids: [878, 12],
    trailer_key: "Way9Dexny3w",
    quality: "4K",
  },
  {
    id: 533535,
    title: "Deadpool & Wolverine",
    overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop_path: "/yDHYTjA3R0jFYba16jBB1jv82E9.jpg",
    vote_average: 7.7,
    vote_count: 4200,
    release_date: "2024-07-26",
    media_type: "movie",
    genre_ids: [28, 35, 878],
    trailer_key: "73_1biulkYk",
    quality: "4K",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    vote_average: 8.1,
    vote_count: 8900,
    release_date: "2023-07-21",
    media_type: "movie",
    genre_ids: [18, 36],
    trailer_key: "uYPbbksJxIg",
    quality: "4K",
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    vote_average: 8.4,
    vote_count: 6700,
    release_date: "2023-06-02",
    media_type: "movie",
    genre_ids: [16, 28, 12, 878],
    trailer_key: "cqGjhVJWtEg",
    quality: "4K",
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    vote_average: 8.4,
    vote_count: 34500,
    release_date: "2014-11-05",
    media_type: "movie",
    genre_ids: [12, 18, 878],
    trailer_key: "zSWdZVtXT7E",
    quality: "4K",
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    vote_average: 8.5,
    vote_count: 32000,
    release_date: "2008-07-16",
    media_type: "movie",
    genre_ids: [18, 28, 80, 53],
    trailer_key: "EXeTwQWrcwY",
    quality: "4K",
  },
  {
    id: 94605,
    title: "Arcane",
    name: "Arcane",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
    poster_path: "/fqldf2t8ztc9aiwn397FvFeNZNT.jpg",
    backdrop_path: "/2rmK7mnchsl935x82gunqpY0ea5.jpg",
    vote_average: 8.7,
    vote_count: 4100,
    first_air_date: "2021-11-06",
    media_type: "tv",
    genre_ids: [16, 10765, 10759],
    trailer_key: "fXmAurh012s",
    quality: "4K",
  },
  {
    id: 66732,
    title: "Stranger Things",
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    vote_average: 8.6,
    vote_count: 17200,
    first_air_date: "2016-07-15",
    media_type: "tv",
    genre_ids: [18, 10765, 9648],
    trailer_key: "b9EkMc79ZSU",
    quality: "4K",
  },
  {
    id: 1399,
    title: "Game of Thrones",
    name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
    poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    vote_average: 8.4,
    vote_count: 23100,
    first_air_date: "2011-04-17",
    media_type: "tv",
    genre_ids: [10765, 18, 10759],
    trailer_key: "KPLWWIOCOOQ",
    quality: "4K",
  },
  {
    id: 100088,
    title: "The Last of Us",
    name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
    poster_path: "/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
    backdrop_path: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    vote_average: 8.6,
    vote_count: 5300,
    first_air_date: "2023-01-15",
    media_type: "tv",
    genre_ids: [18, 10765],
    trailer_key: "uLtkt8BonwM",
    quality: "4K",
  },
  {
    id: 94997,
    title: "House of the Dragon",
    name: "House of the Dragon",
    overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights.",
    poster_path: "/t9Xke5724fqtp0K2HNq0z95nryE.jpg",
    backdrop_path: "/etjA2o5w6bN4UaB72Z7sN15D39P.jpg",
    vote_average: 8.4,
    vote_count: 4800,
    first_air_date: "2022-08-21",
    media_type: "tv",
    genre_ids: [10765, 18, 10759],
    trailer_key: "DotnJ7tTA34",
    quality: "4K",
  },
  {
    id: 1396,
    title: "Breaking Bad",
    name: "Breaking Bad",
    overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He turns to a life of crime.",
    poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    vote_average: 8.9,
    vote_count: 14000,
    first_air_date: "2008-01-20",
    media_type: "tv",
    genre_ids: [18, 80],
    trailer_key: "HhesaQXLuRY",
    quality: "4K",
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who steals corporate secrets through the use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    vote_average: 8.4,
    vote_count: 36000,
    release_date: "2010-07-15",
    media_type: "movie",
    genre_ids: [28, 878, 12],
    trailer_key: "YoHD9XEInc0",
    quality: "4K",
  },
  {
    id: 76600,
    title: "Avatar: The Way of Water",
    overview: "Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/8rpDcsfLJypbO6vREc0547VKqEv.jpg",
    vote_average: 7.6,
    vote_count: 11000,
    release_date: "2022-12-14",
    media_type: "movie",
    genre_ids: [878, 12, 28],
    trailer_key: "d9MyW72ELq0",
    quality: "4K",
  },
  {
    id: 19995,
    title: "Avatar",
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.",
    poster_path: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    backdrop_path: "/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg",
    vote_average: 7.6,
    vote_count: 31000,
    release_date: "2009-12-15",
    media_type: "movie",
    genre_ids: [28, 12, 14, 878],
    trailer_key: "5PSNL1qE6VY",
    quality: "4K",
  },
  {
    id: 671,
    title: "Harry Potter and the Philosopher's Stone",
    overview: "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
    poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    backdrop_path: "/hziiv1445GQx5Y5x9yaZd49x29Q.jpg",
    vote_average: 7.9,
    vote_count: 26000,
    release_date: "2001-11-16",
    media_type: "movie",
    genre_ids: [12, 14],
    trailer_key: "VyHV0BRZxoQ",
    quality: "HD",
  },
  {
    id: 299536,
    title: "Avengers: Infinity War",
    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.",
    poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdrop_path: "/mDfJG3LC3Dqb67AZ52x3Z0jOS0c.jpg",
    vote_average: 8.2,
    vote_count: 29000,
    release_date: "2018-04-25",
    media_type: "movie",
    genre_ids: [12, 28, 878],
    trailer_key: "6ZfuNTqbHE8",
    quality: "4K",
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more.",
    poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    vote_average: 8.2,
    vote_count: 25000,
    release_date: "2019-04-24",
    media_type: "movie",
    genre_ids: [12, 878, 28],
    trailer_key: "TcMBFSGVi1c",
    quality: "4K",
  }
];

export async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const apiKey =
    process.env.NEXT_PUBLIC_TMDB_API_KEY ||
    process.env.TMDB_API_KEY ||
    DEFAULT_TMDB_API_KEY;

  try {
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      language: 'en-US',
      ...params,
    });
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('TMDB API Error:', err);
    return null;
  }
}

export async function getMediaDetails(id: number, mediaType: 'movie' | 'tv' = 'movie') {
  try {
    const data = await fetchFromTMDB(`/${mediaType}/${id}`, {
      append_to_response: 'videos',
    });
    return data;
  } catch (err) {
    console.error('Error fetching details:', err);
    return null;
  }
}

export async function getTrendingMedia(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/trending/all/day');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      title: item.title || item.name,
      quality: '4K',
    }));
  }
  return FALLBACK_MOVIES;
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/movie/popular');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      media_type: 'movie',
      quality: '4K',
    }));
  }
  return FALLBACK_MOVIES.filter((m) => m.media_type === 'movie' || !m.media_type);
}

export async function getTopRated(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/movie/top_rated');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      media_type: 'movie',
      quality: '4K',
    }));
  }
  return [...FALLBACK_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
}

export async function getPopularTV(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/tv/popular');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      title: item.name,
      media_type: 'tv',
      quality: 'HD',
    }));
  }
  return FALLBACK_MOVIES.filter((m) => m.media_type === 'tv');
}

export async function getLatestMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/movie/now_playing');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      media_type: 'movie',
      quality: '4K',
    }));
  }
  return FALLBACK_MOVIES;
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB('/movie/upcoming');
  if (data?.results?.length) {
    return data.results.map((item: any) => ({
      ...item,
      media_type: 'movie',
      quality: '4K',
    }));
  }
  return FALLBACK_MOVIES;
}

export async function searchTitles(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await fetchFromTMDB('/search/multi', { query });
  if (data?.results?.length) {
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        ...item,
        title: item.title || item.name,
        quality: 'HD',
      }));
  }

  // Filter fallback
  const q = query.toLowerCase();
  return FALLBACK_MOVIES.filter(
    (m) =>
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.overview && m.overview.toLowerCase().includes(q))
  );
}
