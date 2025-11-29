import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useRouter } from "expo-router";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/400x300/eee/999.png?text=No+Image";

export default function RideFeed() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "car",
    "bike",
    "scooter",
    "electric-car",
    "electric-bike",
    "electric-scooter",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("http://192.168.10.83:5000/api/products")
      .then((r) => r.json())
      .then((json) => setData(json.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((item) => {
    const matchSearch = item.text
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === "All" ? true : item.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const RideCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/details/${item._id}`)}
      style={{
        width: "47%",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 20,
        marginBottom: 22,
        elevation: 4,
      }}
    >
      <Image
        source={{ uri: item.image || FALLBACK_IMAGE }}
        style={{
          width: "100%",
          height: 120,
          resizeMode: "contain",
        }}
      />

      <Text
        style={{
          marginTop: 10,
          fontSize: 16,
          fontWeight: "700",
          color: "#1f2937",
        }}
        numberOfLines={1}
      >
        {item.text}
      </Text>

      <Text style={{ marginTop: 4, fontSize: 14, color: "#6b7280" }}>
        From ₹{item.price.toLocaleString()}
      </Text>

      <Text
        style={{
          marginTop: 10,
          color: "#FF7A00",
          fontWeight: "700",
          fontSize: 15,
        }}
      >
        View Details →
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 10 }}>Loading rides…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}
    >
      <Text
        style={{
          marginTop: 10,
          color: "#FF7A00",
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        SEARCH
      </Text>

      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          marginTop: 2,
          color: "#111827",
        }}
      >
        Find your favourite ride
      </Text>

      {/* SEARCH BAR */}
      <View
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: 25,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MagnifyingGlassIcon size={22} color="#6b7280" />
        <TextInput
          placeholder="Search for cars, SUVs, EVs..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            marginLeft: 10,
            flex: 1,
            fontSize: 16,
            color: "#111827",
          }}
        />
      </View>

      {/* FIXED HEIGHT CATEGORY FILTER */}
      <View style={{ marginTop: 18 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          renderItem={({ item }) => {
            const active = selectedCategory === item;

            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.8}
                style={{
                  height: 44, // FIXED HEIGHT
                  paddingHorizontal: 20,
                  justifyContent: "center",
                  backgroundColor: active ? "#FF7A00" : "#EFEFEF",
                  borderRadius: 22,
                  marginRight: 12,
                  borderWidth: active ? 1.5 : 0,
                  borderColor: "#FF7A00",
                }}
              >
                <Text
                  style={{
                    color: active ? "#fff" : "#333",
                    fontSize: 15,
                    fontWeight: active ? "800" : "600",
                  }}
                  numberOfLines={1} // Prevent overflow
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* PRODUCT GRID */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RideCard item={item} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      />
    </SafeAreaView>
  );
}
