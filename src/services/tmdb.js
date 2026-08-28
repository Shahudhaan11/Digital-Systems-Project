import { TMDB_API_KEY } from '@env';

const API_KEY = TMDB_API_KEY;

const BASE_URL = "https://api.themoviedb.org/3";

export const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// Ask TMDB for a list of popular movies and hand back the results.
export async function getPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  const data = await response.json();
  return data.results;
}
export async function getMovieDetails(id) {
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return await response.json();
}

export async function getMovies(category = 'popular') {
  const response = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}`);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  const data = await response.json();
  return data.results;
}