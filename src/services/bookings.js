import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "bookings"; // the "label" our data is stored under

// Load every saved booking (returns an array; empty if none yet).
export async function getBookings() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

// Add one new booking to the saved list.
export async function addBooking(booking) {
  const current = await getBookings();
  const updated = [booking, ...current]; // newest first
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

// Delete all bookings (used by the Settings screen later).
export async function clearBookings() {
  await AsyncStorage.removeItem(KEY);
}

// Remove ONE booking by its id.
export async function deleteBooking(id) {
  const current = await getBookings();
  const updated = current.filter((b) => b.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

// Return a list of seats already taken for a given movie + date + time.
// Used to grey out unavailable seats on the seat map.
export async function getTakenSeats(movieTitle, showDate, showTime) {
  const current = await getBookings();
  const taken = [];
  for (const b of current) {
    if (b.movieTitle === movieTitle && b.showDate === showDate && b.showTime === showTime) {
      // b.seats is a string like "A1, B2" — split it back into a list.
      const seatList = b.seats.split(',').map((s) => s.trim());
      taken.push(...seatList);
    }
  }
  return taken;
}