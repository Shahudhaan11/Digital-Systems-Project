import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { colors } from "@/theme";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// Routes guests can browse freely without an account.
const AUTH_SCREENS = ["", "welcome", "login"];
// Routes that require a signed-in user (the actual booking step).
const PROTECTED_SCREENS = ["confirm"];

function RootNavigator() {
  const { session, loading, isRecovery } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentRoute = Array.isArray(segments) ? segments[0] : undefined;
    const routeName = currentRoute == null ? "" : String(currentRoute);

    // A password-reset link creates a real (temporary) session, which would
    // otherwise bounce the user straight into the tabs before they can set
    // a new password. Force them onto reset-password until that's done.
    if (isRecovery) {
      if (routeName !== "reset-password") {
        router.replace("/reset-password" as any);
      }
      return;
    }

    const onAuthScreen = AUTH_SCREENS.includes(routeName);
    const onProtectedScreen = PROTECTED_SCREENS.includes(routeName);

    if (!session && onProtectedScreen) {
      router.replace("/welcome" as any);
    } else if (session && onAuthScreen) {
      router.replace("/(tabs)" as any);
    }
  }, [session, loading, isRecovery, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movie/[id]" options={{ title: "Details" }} />
      <Stack.Screen name="seats" options={{ title: "Choose Seats" }} />
      <Stack.Screen name="confirm" options={{ title: "Confirm Booking" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
