import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const FALLBACK_IMAGE =
  "https://via.placeholder.com/400x300/eee/999.png?text=No+Image";

export default function HomeScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products`;

  // const banners = [
  //   "/my-app/assets/images/carImage1.jpg",
  //   "/my-app/assets/images/carImage2.jpg",
  //   "/my-app/assets/images/carImage3.jpg",
  // ];

  const banners = [
    "data:image/jpeg;base64,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",
    "data:image/jpeg;base64,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",
    "data:image/jpeg;base64,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",
  ];

  const scrollRef = useRef<any>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((json) => setCars(json.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  /** AUTO SLIDE BANNER */
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (bannerIndex + 1) % banners.length;
      setBannerIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [bannerIndex]);

  /** 🔥 PRODUCT CARD – REFERENCE STYLE */
  const CarCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.debateCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/details/${item._id}`)}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: item.image || FALLBACK_IMAGE }}
        style={styles.debateImage}
      />

      {/* CATEGORY */}
      <View style={styles.categoryPill}>
        <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
      </View>

      {/* MORE */}
      <Text style={styles.moreIcon}>⋮</Text>

      {/* CONTENT */}
      <View style={styles.debateContent}>
        <Text style={styles.creatorText}>{item.brand}</Text>

        <Text style={styles.debateTitle} numberOfLines={2}>
          {item.model}
        </Text>

        <Text style={styles.debateDesc} numberOfLines={3}>
          {item.text}
        </Text>

        {/* TAGS */}
        <View style={styles.tagRow}>
          {item.keySpecifications?.slice(0, 3).map((tag: string, i: number) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* META */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>₹ {item.price?.toLocaleString()}</Text>
          <Text style={styles.metaText}>
            {item.standOutFeatures?.length || 0} Highlights
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>VIEW DETAILS</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={{ marginTop: 10 }}>Loading cars…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Text style={styles.menu}>☰</Text>
          <Text style={styles.city}>Bengaluru</Text>
          <View style={styles.profileCircle}>
            <Text style={{ color: "#fff" }}>H</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBar}>
          <MagnifyingGlassIcon size={22} color="#6b7280" />
          <TextInput placeholder="Search Cars" style={styles.searchInput} />
          <View style={styles.expertButton}>
            <Text style={styles.expertText}>AI Expert</Text>
          </View>
        </View>

        {/* BANNER */}
        <ScrollView
          horizontal
          ref={scrollRef}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {banners.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.bannerImage}
            />
          ))}
        </ScrollView>

        {/* DOTS */}
        <View style={styles.dotRow}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, bannerIndex === i && styles.activeDot]}
            />
          ))}
        </View>

        {/* GRID */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[styles.square, { backgroundColor: "#A78BFA" }]}
          >
            <Image
              source={require("../../assets/images/newcar.png")}
              style={styles.squareImage}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.squareTitle}>New Cars</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.square, { backgroundColor: "#FB7185" }]}
          >
            <Image
              source={require("../../assets/images/Usedcar.png")}
              style={styles.squareImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.squareTitle}>Buy Used Car</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[styles.square, { backgroundColor: "#60A5FA" }]}
          >
            <Image
              source={require("../../assets/images/sellcar.png")}
              style={styles.squareImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.squareTitle}>Sell Car</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.square, { backgroundColor: "#818CF8" }]}
          >
            <Image
              source={require("../../assets/images/carnews.png")}
              style={styles.squareImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.squareTitle}>News</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <Text style={styles.sectionTitle}>The most searched cars</Text>

        <FlatList
          data={cars}
          renderItem={({ item }) => <CarCard item={item} />}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  menu: { fontSize: 26 },
  city: { fontSize: 18, fontWeight: "600" },
  profileCircle: {
    width: 32,
    height: 32,
    backgroundColor: "#64748b",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  squareImage: {
    width: 120, // ⬅️ increased
    height: 120, // ⬅️ increased
    position: "absolute",
    top: 12,
    left: 12,
  },

  searchBar: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  expertButton: {
    borderColor: "#FF4500",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expertText: { color: "#FF4500", fontWeight: "700", fontSize: 12 },

  bannerImage: {
    width: width - 32,
    height: 180,
    borderRadius: 16,
    marginHorizontal: 16,
  },

  dotRow: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    margin: 4,
  },
  activeDot: { backgroundColor: "#FF4500" },

  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },
  square: {
    width: "48%",
    height: 140,
    borderRadius: 16,
    padding: 16,
  },
  squareTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 16,
    marginTop: 12,
  },

  /* 🔥 CARD STYLES */
  debateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 14,
    overflow: "hidden",

    // ANDROID
    elevation: 8,

    // IOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  debateImage: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  categoryPill: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
  },

  categoryText: {
    color: "#FFFFFF", // white text
    fontSize: 12,
    fontWeight: "600",
  },

  moreIcon: {
    position: "absolute",
    top: 12,
    right: 14,
    fontSize: 22,
    color: "#fff",
  },

  debateContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "#f9fafb",
  },

  creatorText: { color: "#64748b", fontSize: 14 },

  debateTitle: {
    color: "#0f172a",
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 4,
  },

  debateDesc: {
    color: "#475569",
    marginTop: 8,
  },

  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  tag: {
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    color: "#0f172a",
    fontSize: 12,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: { color: "#94a3b8", fontSize: 13 },

  ctaButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },

  ctaText: {
    color: "#FFFFFF", // white text
    fontSize: 16,
    fontWeight: "600",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
