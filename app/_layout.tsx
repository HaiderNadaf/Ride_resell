import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, Component, ReactNode, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F6F7FB",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>
            Something went wrong
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ padding: 12, backgroundColor: "#2F64FF", borderRadius: 8 }}
          >
            <Text style={{ color: "white" }}>Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    if (isLoaded && rootNavigationState?.key) {
      if (isSignedIn) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/sign-in");
      }
    }

    // Set timeout for auth loading (5 seconds)
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.error("Auth loading timeout");
        setAuthTimeout(true);
        router.replace("/auth/sign-in");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, router, rootNavigationState?.key]);

  if (!isLoaded) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F6F7FB",
        }}
      >
        {authTimeout ? (
          <>
            <Text style={{ marginBottom: 16 }}>
              Authentication taking longer than expected
            </Text>
            <TouchableOpacity onPress={() => router.replace("/auth/sign-in")}>
              <Text style={{ color: "#2F64FF", fontSize: 16 }}>
                Continue to Login
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" color="#2F64FF" />
        )}
      </SafeAreaView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ALWAYS declare routes */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  const clerkPublishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  if (!clerkPublishableKey) {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F6F7FB",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>
            Missing Clerk publishable key. Please configure
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={clerkPublishableKey}
          tokenCache={tokenCache}
        >
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
