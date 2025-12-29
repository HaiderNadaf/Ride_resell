import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
};

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // 🔒 GLOBAL AUTH REDIRECT
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth/sign-in");
    }
  }, [isLoaded, isSignedIn]);

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
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <RootNavigator />
    </ClerkProvider>
  );
}
