import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    router.replace("/auth/sign-in");
    return null;
  }

  const createdAt = new Date(user.createdAt).toLocaleDateString();
  const lastSignedIn = new Date(user.lastSignInAt).toLocaleDateString();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.header}>My Profile</Text>

        {/* USER CARD */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user.imageUrl ||
                "https://via.placeholder.com/150/000/fff?text=User",
            }}
            style={styles.avatar}
          />

          <Text style={styles.username}>{user.fullName || "No Name"}</Text>

          <Text style={styles.subText}>@{user.username || "no-username"}</Text>

          <Text style={styles.email}>
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* USER DETAILS */}
        <View style={styles.infoCard}>
          <InfoRow label="User ID" value={user.id} />

          <InfoRow label="First Name" value={user.firstName || "—"} />

          <InfoRow label="Last Name" value={user.lastName || "—"} />

          <InfoRow
            label="Phone"
            value={user.primaryPhoneNumber?.phoneNumber || "Not added"}
          />

          <InfoRow
            label="Email Verified"
            value={
              user.primaryEmailAddress?.verification?.status === "verified"
                ? "✅ Verified"
                : "❌ Not Verified"
            }
          />

          <InfoRow label="Account Created" value={createdAt} />

          <InfoRow label="Last Login" value={lastSignedIn} />
        </View>

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/(tabs)/create")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut({ sessionId: "all" }); // ✅ IMPORTANT
          }}
        >
          <Text style={styles.logoutText}>Logoutz</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Reusable row component */
function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#555",
  },

  header: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111",
    marginBottom: 20,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 25,
    borderRadius: 22,
    elevation: 3,
    marginBottom: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
  },

  username: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  subText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  email: {
    fontSize: 16,
    color: "#2563eb",
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
  },

  rowLabel: {
    color: "#6b7280",
    fontSize: 14,
  },

  rowValue: {
    fontWeight: "700",
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
  },

  editButton: {
    marginTop: 25,
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 15,
  },

  editButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  logoutButton: {
    marginTop: 15,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 15,
  },

  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
