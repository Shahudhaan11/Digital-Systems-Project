import { supabase } from "./supabase";

function toBooking(row) {
  return {
    id: row.id,
    reference: row.reference,
    movieTitle: row.movie_title,
    showDate: row.show_date,
    showTime: row.show_time,
    seats: row.seats,
    total: row.total,
    bookedAt: new Date(row.created_at).toLocaleString(),
  };
}

// Load every booking made by the signed-in user (newest first).
export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toBooking);
}

// Add one new booking for the signed-in user.
export async function addBooking(booking) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to book.");

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    reference: booking.reference,
    movie_title: booking.movieTitle,
    show_date: booking.showDate,
    show_time: booking.showTime,
    seats: booking.seats,
    total: booking.total,
  });
  if (error) throw error;
}

// Delete every booking belonging to the signed-in user.
export async function clearBookings() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("user_id", user.id);
  if (error) throw error;
}

// Remove ONE booking by its id.
export async function deleteBooking(id) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

// Return a list of seats already taken for a given movie + date + time,
// across every user (reads the public taken_seats view, not raw bookings).
export async function getTakenSeats(movieTitle, showDate, showTime) {
  const { data, error } = await supabase
    .from("taken_seats")
    .select("seats")
    .eq("movie_title", movieTitle)
    .eq("show_date", showDate)
    .eq("show_time", showTime);
  if (error) throw error;

  const taken = [];
  for (const row of data) {
    taken.push(...row.seats.split(",").map((s) => s.trim()));
  }
  return taken;
}
