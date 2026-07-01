import { AppThemeProvider } from "@/context/app-theme";
import { AppAvailabilityProvider } from "../context/app-availability";
import { Stack } from "expo-router";

export default function rootLayout() {
  return (
    <AppThemeProvider>
      <AppAvailabilityProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" />
        </Stack>
      </AppAvailabilityProvider>
    </AppThemeProvider>
  );
}
