// src/app/(tabs)/bookings.tsx
import { deleteBooking, getBookings } from "@/services/bookings";
import { colors } from "@/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Booking = {
  id: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  seats: string;
  total: string;
  bookedAt: string;
  reference?: string;
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function load() {
    const saved = await getBookings();
    setBookings(saved);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  function confirmCancel(id: string, movieTitle: string) {
    Alert.alert("Cancel booking?", `Remove your booking for ${movieTitle}?`, [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          await deleteBooking(id);
          load();
        },
      },
    ]);
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptyText}>
          Book a movie and it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.movie}>{item.movieTitle}</Text>
            <Text style={styles.detail}>
              {item.showDate} · {item.showTime}
            </Text>
            <Text style={styles.detail}>Seats: {item.seats}</Text>
            <Text style={styles.detail}>Total: ${item.total}</Text>
            {item.reference ? (
              <Text style={styles.reference}>Ref: {item.reference}</Text>
            ) : null}
            <Text style={styles.date}>Booked: {item.bookedAt}</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => confirmCancel(item.id, item.movieTitle)}
            >
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
    padding: 24,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: "center" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  movie: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  detail: { fontSize: 14, color: colors.muted, marginBottom: 2 },
  reference: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: "bold",
    marginTop: 4,
  },
  date: { fontSize: 12, color: colors.muted, marginTop: 6 },
  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  cancelText: { color: colors.danger, fontWeight: "bold" },
});
