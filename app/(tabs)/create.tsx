import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products/create`;
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const CATEGORY_OPTIONS = [
  "car",
  "bike",
  "scooter",
  "electric-car",
  "electric-bike",
  "electric-scooter",
];

// 🔔 REQUIRED notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function CreateProduct() {
  const [imageUri, setImageUri] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("car");
  const [loading, setLoading] = useState(false);

  // 🔔 REGISTER PUSH TOKEN (ONCE)
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Notification permission denied");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("📲 PUSH TOKEN:", token);

      // 👉 SAVE TOKEN TO BACKEND
      await fetch(`${BASE_URL}/api/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    })();
  }, []);

  // 📸 Pick image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 🚀 Submit product
  const submitProduct = async () => {
    if (!imageUri || !brand || !model || !price || !category) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("image", {
      uri: imageUri,
      name: "vehicle.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("price", price);
    formData.append("category", category);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      Alert.alert("Success", "Vehicle added successfully!");

      setImageUri("");
      setBrand("");
      setModel("");
      setPrice("");
      setCategory("car");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Add New Vehicle</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#999" />
            <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={brand}
        onChangeText={setBrand}
      />

      <TextInput
        style={styles.input}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (₹)"
        keyboardType="numeric"
        value={price}
        onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ""))}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {CATEGORY_OPTIONS.map((opt) => (
            <Picker.Item
              key={opt}
              label={opt.replace("-", " ").toUpperCase()}
              value={opt}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={submitProduct}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? "UPLOADING..." : "ADD VEHICLE"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePicker: {
    height: 220,
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    marginBottom: 16,
  },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  imagePlaceholderText: { marginTop: 10, color: "#64748b" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontWeight: "600", marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
