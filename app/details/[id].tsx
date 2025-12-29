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

  const shareOnWhatsApp = async () => {
    if (!data) return;

    const link = `https://myapp.page.link/detail/${id}`;
    const message = `🚗 ${data.model || data.text}

💰 ₹ ${(data.price / 100000).toFixed(2)} Lakh

👉 ${link}`;

    await Share.share({ message });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No details found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Floating WhatsApp */}
      <TouchableOpacity
        onPress={shareOnWhatsApp}
        style={styles.shareBtn}
        activeOpacity={0.85}
      >
        <FontAwesome name="whatsapp" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE */}
        <Image source={{ uri: data.image }} style={styles.heroImage} />

        {/* TITLE CARD */}
        <View style={styles.titleCard}>
          <Text style={styles.brand}>{data.brand}</Text>
          <Text style={styles.title}>{data.model || data.text}</Text>
          <Text style={styles.price}>
            ₹ {(data.price / 100000).toFixed(2)} Lakh*
          </Text>
        </View>

        {/* QUICK HIGHLIGHTS */}
        <View style={styles.chipRow}>
          {data.keySpecifications
            ?.slice(0, 3)
            .map((item: string, i: number) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
        </View>

        {/* DESCRIPTION */}
        <Section title="Overview">
          <Text style={styles.desc}>{data.text}</Text>
        </Section>

        {/* SPECIFICATIONS */}
        {data.specs && (
          <Section title="Specifications">
            {Object.entries(data.specs).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* TOP FEATURES */}
        <Section title="Top Features">
          {data.topFeatures?.map((item: string, i: number) => (
            <Bullet key={i} text={item} />
          ))}
        </Section>

        {/* STANDOUT FEATURES */}
        <Section title="Standout Features">
          {data.standOutFeatures?.map((item: string, i: number) => (
            <Bullet key={i} text={item} />
          ))}
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroImage: {
    width: "100%",
    height: 280,
  },

  titleCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  brand: {
    color: "#64748b",
    fontSize: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 6,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginTop: 16,
  },

  chip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },

  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },

  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  specKey: {
    color: "#64748b",
    fontWeight: "600",
  },

  specValue: {
    fontWeight: "700",
  },

  bullet: {
    flexDirection: "row",
    marginBottom: 8,
  },

  bulletDot: {
    fontSize: 18,
    marginRight: 6,
  },

  bulletText: {
    fontSize: 15,
    color: "#334155",
  },

  shareBtn: {
    position: "absolute",
    right: 16,
    top: 40,
    backgroundColor: "#25D366",
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    elevation: 4,
  },
});
