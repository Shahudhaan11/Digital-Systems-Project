// src/app/_layout.tsx
import { colors } from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "bold" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ title: "Details" }} />
        <Stack.Screen name="seats" options={{ title: "Choose Seats" }} />
        <Stack.Screen name="confirm" options={{ title: "Confirm Booking" }} />
      </Stack>
    </>
  );
}
