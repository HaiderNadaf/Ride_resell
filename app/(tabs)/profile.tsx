import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Profile</Text>

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
        <Text style={styles.email}>
          {user.primaryEmailAddress?.emailAddress}
        </Text>
        {/* 
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        > */}
        <Text style={styles.editButtonText}>Edit Profile</Text>
        {/* </TouchableOpacity> */}
      </View>

      {/* ACTION BUTTONS */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => signOut().then(() => router.replace("/sign-in"))}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

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
    marginBottom: 25,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 25,
    borderRadius: 20,
    elevation: 4,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },

  username: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  email: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },

  editButton: {
    marginTop: 15,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 15,
  },

  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
