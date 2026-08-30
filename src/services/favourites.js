import { supabase } from './supabase';

function toFavourite(row) {
  return {
    id: row.movie_id,
    title: row.title,
    poster_path: row.poster_path,
    vote_average: row.vote_average,
  };
}

// Load every favourite saved by the signed-in user (newest first).
export async function getFavourites() {
  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toFavourite);
}

export async function isFavourite(id) {
  const { data, error } = await supabase
    .from('favourites')
    .select('movie_id')
    .eq('movie_id', id)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleFavourite(movie) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to save favourites.');

  const exists = await isFavourite(movie.id);
  if (exists) {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movie.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('favourites').insert({
    user_id: user.id,
    movie_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
  });
  if (error) throw error;
  return true;
}

export async function clearFavourites() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', user.id);
  if (error) throw error;
}
