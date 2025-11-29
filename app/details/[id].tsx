import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.10.83:5000/api/products";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [id]);

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
    <ScrollView style={styles.container}>
      <Image source={{ uri: data.image }} style={styles.mainImage} />

      <Text style={styles.title}>{data.text}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainImage: { width: "100%", height: 240, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 16 },
  price: { fontSize: 18, marginTop: 6, color: "#FF4500", fontWeight: "600" },
  sectionTitle: { fontSize: 20, marginTop: 20, fontWeight: "700" },
  box: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  listItem: { fontSize: 16, marginBottom: 6 },
  specItem: { fontSize: 15, marginBottom: 4, fontWeight: "600" },
});
