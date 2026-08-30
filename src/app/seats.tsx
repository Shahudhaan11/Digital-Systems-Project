// src/app/seats.tsx
import { getTakenSeats } from "@/services/bookings";
import { useAuth } from "@/context/AuthProvider";
import { colors } from "@/theme";
import { confirmAction } from "@/utils/confirmDialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRICE = 12;
const ROWS = ["A", "B", "C", "D", "E"];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SHOWTIMES = ["11:00", "14:30", "17:00", "20:30"];

function getNextDays(count: number): string[] {
  const days: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(
      d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
  }
  return days;
}
const DAYS = getNextDays(7);

export default function SeatsScreen() {
  const { movieTitle } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);

  useEffect(() => {
    async function loadTaken() {
      if (selectedDate && selectedTime) {
        const taken = await getTakenSeats(
          String(movieTitle),
          selectedDate,
          selectedTime,
        );
        setTakenSeats(taken);
      } else {
        setTakenSeats([]);
      }
    }
    loadTaken();
  }, [selectedDate, selectedTime, movieTitle]);

  function toggleSeat(seat: string) {
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((s) => s !== seat)
        : [...current, seat],
    );
  }

  const total = selectedSeats.length * PRICE;
  const ready = selectedDate && selectedTime && selectedSeats.length > 0;

  function goToConfirm() {
    if (!user) {
      confirmAction(
        "Log in required",
        "Please log in or create an account to complete your booking.",
        () => router.push("/welcome" as any),
        "Log In / Sign Up",
      );
      return;
    }

    router.push({
      pathname: "/confirm",
      params: {
        movieTitle,
        showDate: selectedDate,
        showTime: selectedTime,
        seats: selectedSeats.join(", "),
        total: total.toString(),
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{movieTitle}</Text>

        <Text style={styles.sectionLabel}>Select a date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map((day) => {
            const active = selectedDate === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Select a showtime</Text>
        <View style={styles.timeRow}>
          {SHOWTIMES.map((time) => {
            const active = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Select your seats</Text>
        <View style={styles.screenBar}>
          <Text style={styles.screenText}>SCREEN</Text>
        </View>

        <View style={styles.grid}>
          {ROWS.map((row) => (
            <View key={row} style={styles.row}>
              {NUMBERS.map((num) => {
                const seat = `${row}${num}`;
                const isSelected = selectedSeats.includes(seat);
                const isTaken = takenSeats.includes(seat);
                return (
                  <TouchableOpacity
                    key={seat}
                    disabled={isTaken}
                    style={[
                      styles.seat,
                      isSelected && styles.seatSelected,
                      isTaken && styles.seatTaken,
                    ]}
                    onPress={() => toggleSeat(seat)}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        isSelected && styles.seatTextSelected,
                        isTaken && styles.seatTextTaken,
                      ]}
                    >
                      {seat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendBox, { backgroundColor: colors.seat }]}
            />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendBox, { backgroundColor: colors.accent }]}
            />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendBox, { backgroundColor: colors.seatTaken }]}
            />
            <Text style={styles.legendText}>Taken</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.total}>
          {selectedSeats.length} seat(s) · ${total}
        </Text>
        <TouchableOpacity
          style={[styles.button, !ready && styles.buttonDisabled]}
          disabled={!ready}
          onPress={goToConfirm}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  timeRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  screenBar: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  screenText: { color: colors.muted, letterSpacing: 4, fontSize: 12 },
  grid: { alignItems: "center" },
  row: { flexDirection: "row", marginBottom: 10 },
  seat: {
    width: 34,
    height: 34,
    margin: 4,
    borderRadius: 6,
    backgroundColor: colors.seat,
    justifyContent: "center",
    alignItems: "center",
  },
  seatSelected: { backgroundColor: colors.accent },
  seatTaken: { backgroundColor: colors.seatTaken },
  seatText: { fontSize: 10, color: colors.muted },
  seatTextSelected: { color: "#fff", fontWeight: "bold" },
  seatTextTaken: { color: "#ffffff" },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 6,
  },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.muted },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  total: { fontSize: 16, fontWeight: "600", color: colors.text },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonDisabled: { backgroundColor: "#2C333D" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
