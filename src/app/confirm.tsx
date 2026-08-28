// src/app/confirm.tsx
import { addBooking } from "@/services/bookings";
import { colors } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed bar widths for the fake barcode.
const BARS = [
  3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 2, 1, 3, 1, 2, 1,
  1, 3, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3,
];

export default function ConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const movieTitle = String(params.movieTitle ?? "Unknown");
  const showDate = String(params.showDate ?? "-");
  const showTime = String(params.showTime ?? "-");
  const seats = String(params.seats ?? "-");
  const total = String(params.total ?? "0");

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");

  async function confirmBooking() {
    setSaving(true);
    const ref = "SF-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    try {
      await addBooking({
        id: Date.now().toString(),
        reference: ref,
        movieTitle,
        showDate,
        showTime,
        seats,
        total,
        bookedAt: new Date().toLocaleString(),
      });
    } catch (e) {
      console.log("SAVE FAILED:", e);
    }
    setReference(ref);
    setSaving(false);
    setDone(true);
  }

  // ---- CONFIRMED: show a ticket ----
  if (done) {
    return (
      <View style={styles.center}>
        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <Text style={styles.brand}>🎬 SeatFlick</Text>
            <Text style={styles.confirmed}>CONFIRMED</Text>
          </View>

          <Text style={styles.ticketMovie}>{movieTitle}</Text>

          <View style={styles.ticketRow}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>DATE</Text>
              <Text style={styles.cellValue}>{showDate}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>TIME</Text>
              <Text style={styles.cellValue}>{showTime}</Text>
            </View>
          </View>

          <View style={styles.ticketRow}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>SEATS</Text>
              <Text style={styles.cellValue}>{seats}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>TOTAL</Text>
              <Text style={styles.cellValue}>${total}</Text>
            </View>
          </View>

          {/* dashed divider */}
          <View style={styles.dashRow}>
            {Array.from({ length: 34 }).map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* fake barcode */}
          <View style={styles.barcode}>
            {BARS.map((w, i) => (
              <View
                key={i}
                style={{
                  width: w,
                  height: 44,
                  backgroundColor: i % 2 === 0 ? "#111" : "transparent",
                  marginRight: 2,
                }}
              />
            ))}
          </View>
          <Text style={styles.ref}>{reference}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Back to Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- SUMMARY: before confirming ----
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Summary</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Movie</Text>
          <Text style={styles.rowValue}>{movieTitle}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date</Text>
          <Text style={styles.rowValue}>{showDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Time</Text>
          <Text style={styles.rowValue}>{showTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Seats</Text>
          <Text style={styles.rowValue}>{seats}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.rowValue}>${total}</Text>
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { fontSize: 15, color: colors.muted },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  button: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // ticket
  ticket: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  ticketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  brand: { color: colors.accent, fontWeight: "bold", fontSize: 16 },
  confirmed: {
    color: "#3DDC84",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  ticketMovie: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
  },
  ticketRow: { flexDirection: "row", marginBottom: 14 },
  cell: { flex: 1 },
  cellLabel: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 3,
  },
  cellValue: { color: colors.text, fontSize: 15, fontWeight: "600" },
  dashRow: { flexDirection: "row", overflow: "hidden", marginVertical: 18 },
  dash: {
    width: 6,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginRight: 4,
  },
  barcode: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ref: {
    color: colors.text,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 2,
    fontWeight: "bold",
    fontSize: 16,
  },
});
