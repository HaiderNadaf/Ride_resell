import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
};

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth/sign-in");
    }
  }, [isLoaded, isSignedIn, router, rootNavigationState?.key]);

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ALWAYS declare routes */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <RootNavigator />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
