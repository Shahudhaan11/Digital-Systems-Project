// src/app/(tabs)/settings.tsx
import { clearBookings } from "@/services/bookings";
import { colors } from "@/theme";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  function handleClear() {
    Alert.alert(
      "Clear all bookings?",
      "This will permanently remove every saved booking.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearBookings();
            Alert.alert("Done", "All bookings have been cleared.");
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleClear}>
        <Text style={styles.buttonText}>Clear All Bookings</Text>
      </TouchableOpacity>

      <Text style={styles.note}>SeatFlick · Student project</Text>
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
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  note: { marginTop: 24, color: colors.muted, fontSize: 13 },
});
