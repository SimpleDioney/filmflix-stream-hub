
export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  media_type?: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path?: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string;
  air_date?: string;
}

export interface MediaDetails extends MediaItem {
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  tagline?: string;
  homepage?: string;
  status?: string;
  original_language?: string;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
}
