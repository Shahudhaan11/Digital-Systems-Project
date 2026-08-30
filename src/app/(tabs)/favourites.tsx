import { useAuth } from "@/context/AuthProvider";
import { getFavourites, toggleFavourite } from "@/services/favourites";
import { IMAGE_URL } from "@/services/tmdb";
import { colors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FavouritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favs, setFavs] = useState([]);

  async function load() {
    setFavs(user ? await getFavourites() : []);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user]),
  );

  async function remove(movie) {
    await toggleFavourite(movie); // toggling an existing favourite removes it
    load();
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={colors.muted} />
        <Text style={styles.emptyTitle}>Log in to save favourites</Text>
        <Text style={styles.emptyText}>
          Create an account or log in to start saving movies.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/welcome")}
        >
          <Text style={styles.loginButtonText}>Log In / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (favs.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={colors.muted} />
        <Text style={styles.emptyTitle}>No favourites yet</Text>
        <Text style={styles.emptyText}>
          Tap the heart on a movie to save it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Favourites</Text>
      <FlatList
        data={favs}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
            <TouchableOpacity style={styles.heart} onPress={() => remove(item)}>
              <Ionicons name="heart" size={22} color={colors.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: "center" },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  loginButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  poster: { width: 70, height: 105 },
  info: { flex: 1, padding: 14, justifyContent: "center" },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  rating: { fontSize: 14, color: colors.muted },
  heart: { padding: 14 },
});
