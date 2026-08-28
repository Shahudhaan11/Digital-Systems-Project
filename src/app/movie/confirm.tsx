import { addBooking } from "@/services/bookings";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ConfirmScreen() {
  const { movieTitle, showDate, showTime, seats, total } =
    useLocalSearchParams();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");

  async function confirmBooking() {
    setSaving(true);

    // Make a simple booking reference, e.g. "SF-8H3K2".
    const ref = "SF-" + Math.random().toString(36).slice(2, 7).toUpperCase();

    const booking = {
      id: Date.now().toString(),
      reference: ref,
      movieTitle: movieTitle,
      showDate: showDate,
      showTime: showTime,
      seats: seats,
      total: total,
      bookedAt: new Date().toLocaleString(),
    };

    console.log("2. About to save:", booking);

    try {
      await addBooking(booking);
      console.log("3. Saved successfully");
      setReference(ref);
      setDone(true);
    } catch (e) {
      console.log("SAVE FAILED:", e);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.tick}>✓</Text>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successText}>
          Your seats for {movieTitle} are booked.
        </Text>
        <Text style={styles.reference}>Reference: {reference}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Back to Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Summary</Text>

      <View style={styles.card}>
        <Row label="Movie" value={movieTitle} />
        <Row label="Date" value={showDate} />
        <Row label="Time" value={showTime} />
        <Row label="Seats" value={seats} />
        <Row label="Total" value={`$${total}`} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={confirmBooking}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { fontSize: 15, color: "#666" },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#e50914",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  tick: { fontSize: 64, color: "#2e7d32" },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  reference: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e50914",
    marginBottom: 24,
    letterSpacing: 1,
  },
});
