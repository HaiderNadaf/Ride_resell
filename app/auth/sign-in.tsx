import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn, useUser } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showSecondFactor, setShowSecondFactor] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded || !signInLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  const onPress = async () => {
    if (!signInLoaded) return;

    setErr("");
    setLoading(true);

    try {
      if (showSecondFactor) {
        const result = await signIn.attemptSecondFactor({
          strategy: "email_code",
          code,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace("/(tabs)");
          return;
        }

        setErr("Verification is still pending. Please try again.");
        return;
      }

      const result = await signIn.create({
        identifier,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      if (result.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });
        setShowSecondFactor(true);
        setErr("We sent a verification code to your email.");
        return;
      }

      setErr(`Login is not complete yet (${result.status}). Please try again.`);
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
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/images/signIn-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage listings, messages, and alerts.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSubtitle}>
              Use your email and password to continue.
            </Text>

            {err ? <Text style={styles.errorBox}>{err}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#98A2B3"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#98A2B3"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {showSecondFactor ? (
              <>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  placeholder="Enter the code from your email"
                  placeholderTextColor="#98A2B3"
                  keyboardType="number-pad"
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  editable={!loading}
                />
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={onPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : showSecondFactor ? (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" style={styles.link}>
                Create account
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  flex: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7FB",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 18,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  logo: {
    width: 135,
    height: 150,
  },
  title: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: "900",
    color: "#101828",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#667085",
    maxWidth: 320,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#101828",
  },
  cardSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: "#667085",
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#344054",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#FBFCFE",
    borderRadius: 16,
    fontSize: 15,
    marginBottom: 14,
    color: "#101828",
  },
  button: {
    backgroundColor: "#2F64FF",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 4,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
    color: "#667085",
  },
  link: {
    color: "#2F64FF",
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: "#FEF3F2",
    color: "#B42318",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#FECDCA",
  },
});
