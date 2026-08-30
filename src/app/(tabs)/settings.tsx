import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthProvider";
import { clearBookings, getBookings } from "@/services/bookings";
import { clearFavourites, getFavourites } from "@/services/favourites";
import { supabase } from "@/services/supabase";
import { colors } from "@/theme";
import { confirmAction, notify } from "@/utils/confirmDialog";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [bookingCount, setBookingCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const auth = useAuth() as any;
  const user = auth?.user as { email?: string } | null | undefined;
  const username = auth?.username as string | null | undefined;
  const router = useRouter();

  async function loadStats() {
    if (!user) {
      setBookingCount(0);
      setFavCount(0);
      setTotalSpent(0);
      return;
    }

    const bookings = (await getBookings()) as Array<{
      total?: number | string;
    }>;
    const favs = await getFavourites();
    setBookingCount(bookings.length);
    setFavCount(favs.length);
    setTotalSpent(
      bookings.reduce<number>((sum, b) => sum + Number(b.total || 0), 0),
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [user]),
  );

  function confirmClearBookings() {
    confirmAction(
      "Clear all bookings?",
      "This will permanently remove every saved booking.",
      async () => {
        await clearBookings();
        loadStats();
        notify("Done", "All bookings cleared.");
      },
      "Clear",
      true,
    );
  }

  function confirmClearFavourites() {
    confirmAction(
      "Clear all favourites?",
      "This will remove every saved favourite.",
      async () => {
        await clearFavourites();
        loadStats();
        notify("Done", "All favourites cleared.");
      },
      "Clear",
      true,
    );
  }

  function handleLogout() {
    confirmAction(
      "Log out?",
      "You will need to log in again.",
      () => supabase.auth.signOut(),
      "Log out",
      true,
    );
  }

  async function shareApp() {
    try {
      await Share.share({
        message:
          "Check out SeatFlick — book your favourite movies in seconds! 🎬",
      });
    } catch (e) {
      // user dismissed the share sheet; nothing to do
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Settings</Text>

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.aboutCard}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutKey}>Signed in as</Text>
          <Text style={styles.aboutVal}>{username ?? user?.email ?? "Guest"}</Text>
        </View>
      </View>
      {!user && (
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() => router.push("/welcome" as any)}
        >
          <Ionicons name="log-in-outline" size={20} color={colors.accent} />
          <Text style={[styles.rowButtonText, { color: colors.accent }]}>
            Log In / Sign Up
          </Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{bookingCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{favCount}</Text>
          <Text style={styles.statLabel}>Favourites</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>${totalSpent}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      {/* Data management */}
      <Text style={styles.sectionLabel}>DATA</Text>
      <TouchableOpacity style={styles.rowButton} onPress={confirmClearBookings}>
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
        <Text style={styles.rowButtonText}>Clear All Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rowButton}
        onPress={confirmClearFavourites}
      >
        <Ionicons
          name="heart-dislike-outline"
          size={20}
          color={colors.danger}
        />
        <Text style={styles.rowButtonText}>Clear All Favourites</Text>
      </TouchableOpacity>

      {/* About */}
      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={styles.aboutCard}>
        <View style={styles.aboutHeader}>
          <Logo size={38} />
        </View>
        <Text style={styles.tagline}>Your seat to every story.</Text>

        <View style={styles.divider} />

        <View style={styles.aboutRow}>
          <Text style={styles.aboutKey}>Version</Text>
          <Text style={styles.aboutVal}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutKey}>Made by</Text>
          <Text style={styles.aboutVal}>SeatFlick Studios</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutKey}>Updated</Text>
          <Text style={styles.aboutVal}>August 2026</Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareApp}>
          <Ionicons name="share-social-outline" size={18} color="#fff" />
          <Text style={styles.shareText}>Share App</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.attribution}>
        Powered by The Movie Database (TMDB). This product uses the TMDB API but
        is not endorsed or certified by TMDB.
      </Text>

      {user && (
        <TouchableOpacity
          style={[styles.rowButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.rowButtonText}>Log Out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
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
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNum: { color: colors.accent, fontSize: 22, fontWeight: "bold" },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },

  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 20,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  rowButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },

  aboutCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  aboutHeader: { alignItems: "center", marginBottom: 6 },
  tagline: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 12,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  aboutKey: { color: colors.muted, fontSize: 14 },
  aboutVal: { color: colors.text, fontSize: 14, fontWeight: "600" },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
  },
  shareText: { color: "#fff", fontSize: 15, fontWeight: "bold", marginLeft: 8 },

  attribution: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
