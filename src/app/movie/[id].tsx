import { useAuth } from "@/context/AuthProvider";
import { isFavourite, toggleFavourite } from "@/services/favourites";
import { getMovieDetails, IMAGE_URL } from "@/services/tmdb";
import { colors } from "@/theme";
import { confirmAction } from "@/utils/confirmDialog";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
        setFav(user ? await isFavourite(data.id) : false);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  async function onToggleFav() {
    if (!movie) return;
    if (!user) {
      confirmAction(
        "Log in required",
        "Please log in or create an account to save favourites.",
        () => router.push("/welcome" as any),
        "Log In / Sign Up",
      );
      return;
    }
    const nowFav = await toggleFavourite({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
    });
    setFav(nowFav);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Could not load this movie.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View>
        <Image
          source={{ uri: IMAGE_URL + movie.poster_path }}
          style={styles.poster}
        />
        <TouchableOpacity
          style={styles.heart}
          onPress={onToggleFav}
          activeOpacity={0.8}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={26}
            color={fav ? colors.danger : "#fff"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.meta}>
          ⭐ {movie.vote_average.toFixed(1)} • {movie.release_date?.slice(0, 4)}
        </Text>
        <Text style={styles.overview}>{movie.overview}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/seats",
              params: { movieId: id, movieTitle: movie.title },
            })
          }
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  poster: { width: "100%", height: 500 },
  heart: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: { padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  meta: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    color: "#C9D1DB",
    marginBottom: 24,
  },
  muted: { color: colors.muted },
  button: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
