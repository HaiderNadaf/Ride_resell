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

  const banners = [
    require("../../assets/images/banner1.png"),
    require("../../assets/images/banner2.jpg"),
    require("../../assets/images/banner3.jpg"),
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
            <Image key={index} source={img} style={styles.bannerImage} />
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
    marginTop: 7,
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
