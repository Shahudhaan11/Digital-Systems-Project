import { Logo } from "@/components/Logo";
import { supabase } from "@/services/supabase";
import { colors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    setError(null);

    if (isSignUp && !username.trim()) {
      setError("Please choose a username.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const trimmedUsername = username.trim();

      // Best-effort pre-check for a fast, friendly error. The database's
      // unique index on profiles is the real enforcement (handles the rare
      // race where two people sign up with the same name at once).
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", trimmedUsername)
        .maybeSingle();
      if (existing) {
        setLoading(false);
        setError("That username is already taken.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: trimmedUsername } },
      });
      setLoading(false);
      if (error) {
        setError(
          /username|database error saving new user|duplicate/i.test(
            error.message,
          )
            ? "That username is already taken."
            : error.message,
        );
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/welcome" as any)
          }
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <Logo size={48} />
        </View>
        <Text style={styles.title}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Sign up to start booking." : "Log in to continue."}
        </Text>

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
        )}

        <TextInput
          ref={emailRef}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isSignUp && (
          <TouchableOpacity
            onPress={() => router.push("/forgot-password" as any)}
          >
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Sign Up" : "Log In"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
        >
          <Text style={styles.switch}>
            {isSignUp
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  backButton: {
    position: "absolute",
    top: 8,
    left: 0,
    zIndex: 1,
  },
  logoWrap: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 15,
    marginBottom: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  forgotLink: {
    color: colors.accent,
    fontSize: 13,
    textAlign: "right",
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  switch: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
