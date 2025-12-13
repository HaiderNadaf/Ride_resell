import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Share,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products`;

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch full list and find by id (because backend returns array)
  useEffect(() => {
    if (!id) return;

    fetch(API_URL)
      .then((r) => r.json())
      .then((json) => {
        const product = json.data.find((item: any) => item._id === id);
        setData(product);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Share function
  const shareOnWhatsApp = async () => {
    if (!data) return;

    try {
      const link = `https://myapp.page.link/detail/${id}`;

      const title = data.text || "Product";
      const price = data.price
        ? `₹ ${(data.price / 100000).toFixed(2)} Lakh`
        : "Price not available";

      const message = `🚀 Check out this product!

📌 ${title}
💰 ${price}

👉 Open in app:
${link}`;

      await Share.share({ message });
    } catch (err) {
      console.log("Share error:", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text>Loading details…</Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No details found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ FLOATING SHARE ICON */}
      <TouchableOpacity
        onPress={shareOnWhatsApp}
        style={styles.floatingShareBtn}
        activeOpacity={0.85}
      >
        <FontAwesome name="whatsapp" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {/* IMAGE */}
        <Image source={{ uri: data.image }} style={styles.mainImage} />

        {/* TITLE */}
        <Text style={styles.title}>{data.text}</Text>

        {/* PRICE */}
        <Text style={styles.price}>
          ₹ {(data.price / 100000).toFixed(2)} Lakh*
        </Text>

        {/* SPECS */}
        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.box}>
          {Object.entries(data.specs || {}).map(([key, value]) => (
            <Text key={key} style={styles.specItem}>
              {key.toUpperCase()}: {value}
            </Text>
          ))}
        </View>

        {/* KEY SPECIFICATIONS */}
        <Text style={styles.sectionTitle}>Key Specifications</Text>
        <View style={styles.box}>
          {data.keySpecifications?.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>

        {/* TOP FEATURES */}
        <Text style={styles.sectionTitle}>Top Features</Text>
        <View style={styles.box}>
          {data.topFeatures?.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>

        {/* STAND OUT FEATURES */}
        <Text style={styles.sectionTitle}>Stand Out Features</Text>
        <View style={styles.box}>
          {data.standOutFeatures?.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ✅ Floating WhatsApp button */
  floatingShareBtn: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#25D366",
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  mainImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
  },

  price: {
    fontSize: 18,
    marginTop: 6,
    color: "#FF4500",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: "700",
  },

  box: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  listItem: {
    fontSize: 16,
    marginBottom: 6,
  },

  specItem: {
    fontSize: 15,
    marginBottom: 4,
    fontWeight: "600",
  },
});
