import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp, useUser, useAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setErr("");
    setLoading(true);

    try {
      await signOut();

      await signUp.create({
        emailAddress,
        firstName,
        lastName,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (e: any) {
      setErr(e.errors?.[0]?.longMessage || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setErr("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      setErr(e.errors?.[0]?.longMessage || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
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
                  source={require("../../assets/images/logos.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to your inbox to finish creating your
                account.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Verification code</Text>
              <Text style={styles.cardSubtitle}>
                Check your email and enter the code below.
              </Text>

              {err ? <Text style={styles.errorBox}>{err}</Text> : null}

              <Text style={styles.label}>Code</Text>
              <TextInput
                placeholder="Enter verification code"
                placeholderTextColor="#98A2B3"
                style={styles.input}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={onVerifyPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join the marketplace to list, search, and sell vehicles with ease.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign up</Text>
            <Text style={styles.cardSubtitle}>
              A few details to get you started.
            </Text>

            {err ? <Text style={styles.errorBox}>{err}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#98A2B3"
              autoCapitalize="none"
              style={styles.input}
              value={emailAddress}
              onChangeText={setEmailAddress}
            />

            <View style={styles.twoCol}>
              <View style={styles.half}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  placeholder="First name"
                  placeholderTextColor="#98A2B3"
                  autoCapitalize="words"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor="#98A2B3"
                  autoCapitalize="words"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Create password"
              placeholderTextColor="#98A2B3"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={onSignUpPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Link href="/auth/sign-in" style={styles.link}>
                Sign in
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
    maxWidth: 340,
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
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
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
