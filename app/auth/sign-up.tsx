import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSignUp, useUser, useAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [err, setErr] = React.useState("");

  // 🔐 AUTH GUARD
  React.useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [userLoaded, isSignedIn]);

  if (!userLoaded) return null;

  // 🚨 IMPORTANT: SIGN OUT BEFORE SIGN UP
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setErr("");

    try {
      // ⬅️ THIS FIXES THE BUG
      await signOut();

      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (e: any) {
      setErr(e.errors?.[0]?.longMessage || "Sign-up failed");
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setErr("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      setErr(e.errors?.[0]?.longMessage || "Invalid code");
    }
  };

  // ---------------- VERIFY UI ----------------
  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your email
        </Text>

        {err ? <Text style={styles.errorBox}>{err}</Text> : null}

        <TextInput
          placeholder="Verification code"
          style={styles.input}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------- SIGN UP UI ----------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us today</Text>

      {err ? <Text style={styles.errorBox}>{err}</Text> : null}

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        style={styles.input}
        value={emailAddress}
        onChangeText={setEmailAddress}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Link href="/auth/sign-in" style={styles.link}>
          Sign In
        </Link>
      </Text>
    </View>
  );
}

// ------------------------ STYLES ------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 28,
    marginTop: 4,
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
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
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontWeight: "600",
  },
});
