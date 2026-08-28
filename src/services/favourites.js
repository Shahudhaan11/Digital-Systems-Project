import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favourites';

export async function getFavourites() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isFavourite(id) {
  const favs = await getFavourites();
  return favs.some((f) => f.id === id);
}

export async function toggleFavourite(movie) {
  const favs = await getFavourites();
  const exists = favs.some((f) => f.id === movie.id);
  const updated = exists
    ? favs.filter((f) => f.id !== movie.id)
    : [movie, ...favs];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return !exists;
}