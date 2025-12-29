import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [userLoaded, isSignedIn, router]);

  // Show loading until we know auth status
  if (!userLoaded || !signInLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If already signed in, redirect immediately (extra safety)
  if (isSignedIn) {
    router.replace("/(tabs)");
    return null;
  }

  const onPress = async () => {
    if (!signInLoaded) return;

    setErr("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier,
        password,
      });

      if (result.status === "complete") {
        // Important: Set the session as active
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        // Handle cases like needs MFA, etc. (rare for email/password)
        setErr("Login incomplete. Please try again.");
      }
    } catch (e: any) {
      const message =
        e.errors?.[0]?.longMessage ||
        e.errors?.[0]?.message ||
        "Invalid email or password. Please try again.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {err ? <Text style={styles.errorBox}>{err}</Text> : null}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        editable={!loading}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Link href="/auth/sign-up" style={styles.link}>
          Create Account
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 28,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 14,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 15,
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 15,
    textAlign: "center",
  },
});
