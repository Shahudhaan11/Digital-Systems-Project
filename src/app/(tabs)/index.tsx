// src/app/(tabs)/index.tsx
import { Logo } from "@/components/Logo";
import { getMovies, IMAGE_URL } from "@/services/tmdb";
import { colors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  { key: "popular", label: "Popular" },
  { key: "now_playing", label: "Now Playing" },
  { key: "top_rated", label: "Top Rated" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("popular");
  const [search, setSearch] = useState("");

  // Refetch whenever the chosen category changes.
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await getMovies(category);
        if (active) setMovies(results);
      } catch (e) {
        if (active)
          setError("Could not load movies. Check your internet and API key.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [category]);

  // Live filter the loaded list by title.
  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size={40} />
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.muted}>Loading movies…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>No movies match your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/movie/${item.id}`)}
            >
              <Image
                source={{ uri: IMAGE_URL + item.poster_path }}
                style={styles.poster}
              />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.rating}>
                  ⭐ {item.vote_average.toFixed(1)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    marginLeft: 8,
    height: "100%",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  poster: { width: 92, height: 138 },
  info: { flex: 1, padding: 14, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  rating: { fontSize: 14, color: colors.muted },
  muted: { marginTop: 12, color: colors.muted },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
