import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import {
  Bell,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Search,
} from "lucide-react-native";
import {
  fetchProducts,
  fetchNotifications,
  formatMoney,
  normalizeProduct,
  AppNotification,
  Product,
} from "../../lib/marketplace";

const categories = ["All", "Cars", "Bikes", "EVs", "Trucks"];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((items) => {
        if (mounted) setProducts(items.map((item) => normalizeProduct(item)));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchNotifications()
      .then((items) => {
        if (mounted) setNotifications(items);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = matchesVehicleCategory(
        item.category,
        selectedCategory,
      );
      const haystack =
        `${item.brand} ${item.model} ${item.location} ${item.category}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  const featuredCards = filtered.filter((item) => item.featured).slice(0, 3);
  const featuredFallbackCards = filtered.slice(0, 3);
  const recent = filtered;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={styles.brandWrap}>
            <Text style={styles.brandText}>
              <Text style={styles.brandDark}>DEKHO </Text>
              <Text style={styles.brandBlue}>GADI</Text>
            </Text>
            <Text style={styles.brandTagline}>BUY. SELL. EVERY VEHICLE.</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.smallIconCircle}
              onPress={() => router.push("/notifications")}
            >
              <Bell size={18} color="#101828" />
              {notifications.length ? <View style={styles.badge} /> : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar}>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {getInitials(user?.fullName || user?.firstName)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#98A2B3" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search cars, bikes..."
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push("/feed")}
          >
            <SlidersHorizontal size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
        >
          {categories.map((item) => {
            const active = selectedCategory === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Listings</Text>
          <TouchableOpacity
            onPress={() => router.push("/feed")}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={16} color="#2F64FF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredRow}
        >
          {(featuredCards.length ? featuredCards : featuredFallbackCards).map(
            (item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.featuredCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/details/${item._id}`)}
              >
                <View style={styles.cardImageWrap}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                  />
                  <TouchableOpacity style={styles.heartPill}>
                    <Heart size={16} color="#101828" />
                  </TouchableOpacity>
                  {item.featured ? (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Featured</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.listingTitle ||
                      `${item.year} ${item.brand} ${item.model}`}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.location}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {formatMoney(item.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
        </View>

        <View style={styles.recentList}>
          {recent.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.recentCard}
              onPress={() => router.push(`/details/${item._id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.image }} style={styles.recentImage} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {item.listingTitle ||
                    `${item.year} ${item.brand} ${item.model}`}
                </Text>
                <Text style={styles.recentMeta} numberOfLines={1}>
                  {formatMileageLabel(item)}
                </Text>
                <Text style={styles.recentPrice}>
                  {formatMoney(item.price)}
                </Text>
              </View>
              <Heart size={16} color="#D0D5DD" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMileageLabel(item: Product) {
  const mileage = item.mileage
    ? `${item.mileage.toLocaleString()} mi`
    : "Mileage not listed";
  return `${mileage} • ${item.location}`;
}

function matchesVehicleCategory(category: string, selected: string) {
  if (selected === "All") return true;
  if (selected === "Cars") return category.includes("car");
  if (selected === "Bikes") return category.includes("bike");
  if (selected === "EVs") return category.includes("electric");
  if (selected === "Trucks") return category.includes("truck");
  return true;
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

const styles = {
  screen: { flex: 1, backgroundColor: "#F6F7FB" as const },
  content: { paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" } as const,
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#fff",
    overflow: "hidden" as const,
  },
  logoImage: { width: 28, height: 28 },
  brandWrap: { flex: 1, alignItems: "flex-start" as const, marginLeft: 6 },
  brandText: {
    fontSize: 22,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
    lineHeight: 24,
  },
  brandDark: { color: "#101828" },
  brandBlue: { color: "#1F6FB2" },
  brandTagline: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "900" as const,
    letterSpacing: 1.1,
    color: "#667085",
  },
  headerActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  smallIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
  },
  badge: {
    position: "absolute" as const,
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D92D20",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden" as const,
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#DDE7FF",
  },
  avatarFallbackText: {
    color: "#2F64FF",
    fontSize: 12,
    fontWeight: "900" as const,
  },
  avatarImage: { width: 34, height: 34 },
  searchRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#EEF0F5",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#101828",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2F64FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  categoryRow: {
    marginTop: 16,
    paddingLeft: 16,
    minHeight: 42,
  },
  categoryChip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#101828",
  },
  categoryLabel: {
    color: "#667085",
    fontWeight: "700" as const,
  },
  categoryLabelActive: {
    color: "#fff",
  },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#101828",
  },
  seeAll: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  seeAllText: {
    color: "#2F64FF",
    fontWeight: "700" as const,
    marginRight: 4,
  },
  featuredRow: {
    marginTop: 12,
    paddingLeft: 16,
  },
  featuredCard: {
    width: 242,
    borderRadius: 20,
    overflow: "hidden" as const,
    backgroundColor: "#fff",
    marginRight: 14,
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardImageWrap: {
    height: 160,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  cardImage: { width: "100%" as any, height: "100%" as any },
  heartPill: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  featuredBadge: {
    position: "absolute" as const,
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(16,24,40,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: "800" as const, color: "#101828" },
  cardMeta: { marginTop: 4, color: "#667085", fontSize: 13 },
  cardPrice: {
    marginTop: 8,
    color: "#2F64FF",
    fontSize: 18,
    fontWeight: "900" as const,
  },
  recentList: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  recentImage: {
    width: 88,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#EEF0F5",
  },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 15, fontWeight: "800" as const, color: "#101828" },
  recentMeta: { marginTop: 4, color: "#667085", fontSize: 12 },
  recentPrice: {
    marginTop: 4,
    color: "#2F64FF",
    fontSize: 16,
    fontWeight: "900" as const,
  },
};
