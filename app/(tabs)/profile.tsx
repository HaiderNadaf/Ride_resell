import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  /* 🔹 Clerk still initializing */
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  /* 🔹 User not logged in */
  if (!isSignedIn) {
    router.replace("/auth/sign-in");
    return null;
  }

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";

  const lastSignedIn = user?.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleDateString()
    : "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.header}>My Profile</Text>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.imageUrl ||
                "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff",
            }}
            style={styles.avatar}
          />

          <Text style={styles.username}>{user?.fullName || "User"}</Text>

          {user?.primaryEmailAddress?.emailAddress && (
            <Text style={styles.email}>
              {user.primaryEmailAddress.emailAddress}
            </Text>
          )}
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <InfoRow label="User ID" value={user.id} />

          {user.firstName && (
            <InfoRow label="First Name" value={user.firstName} />
          )}

          {user.lastName && <InfoRow label="Last Name" value={user.lastName} />}

          {user.primaryPhoneNumber?.phoneNumber && (
            <InfoRow
              label="Phone"
              value={user.primaryPhoneNumber.phoneNumber}
            />
          )}

          <InfoRow
            label="Email Status"
            value={
              user.primaryEmailAddress?.verification?.status === "verified"
                ? "Verified"
                : "Not Verified"
            }
          />

          <InfoRow label="Joined On" value={createdAt} />
          <InfoRow label="Last Login" value={lastSignedIn} />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut();
            router.replace("/auth/sign-in");
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* 🔹 Reusable row */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/* 🔹 STYLES */
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
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },

  header: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 20,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },

  username: {
    fontSize: 22,
    fontWeight: "800",
  },

  email: {
    marginTop: 6,
    color: "#2563eb",
    fontSize: 15,
  },

  infoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    padding: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  rowLabel: {
    color: "#6b7280",
  },

  rowValue: {
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },

  logoutButton: {
    marginTop: 25,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 16,
  },

  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
});
