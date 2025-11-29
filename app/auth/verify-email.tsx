import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function VerifyEmail() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      await setActive({ session: result.createdSessionId });

      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Verify Your Email
      </Text>

      <TextInput
        placeholder="Enter Code"
        value={code}
        onChangeText={setCode}
        style={{ borderWidth: 1, padding: 12, marginTop: 20 }}
      />

      {error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

      <TouchableOpacity
        onPress={handleVerify}
        style={{ backgroundColor: "black", padding: 15, marginTop: 20 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
