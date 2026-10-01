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

// Add one new booking for the signed-in user. Goes through the book_seats
// RPC so the booking row and its individual seat rows are created in one
// transaction - if another user has already taken one of these seats, the
// unique constraint on booked_seats rejects the whole booking atomically
// instead of letting two people double-book the same seat.
export async function addBooking(booking) {
  const seats = booking.seats
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.rpc("book_seats", {
    p_movie_title: booking.movieTitle,
    p_show_date: booking.showDate,
    p_show_time: booking.showTime,
    p_seats: seats,
    p_total: booking.total,
    p_reference: booking.reference,
  });

  if (error) {
    if (/booked_seats.*unique|duplicate key/i.test(error.message)) {
      throw new Error(
        "Sorry, one or more of your selected seats was just booked by someone else. Please choose different seats.",
      );
    }
    throw error;
  }
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
// across every user (reads the public booked_seats table, one row per seat).
export async function getTakenSeats(movieTitle, showDate, showTime) {
  const { data, error } = await supabase
    .from("booked_seats")
    .select("seat")
    .eq("movie_title", movieTitle)
    .eq("show_date", showDate)
    .eq("show_time", showTime);
  if (error) throw error;

  return data.map((row) => row.seat);
}
