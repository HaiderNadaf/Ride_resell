import { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Bell, Edit3, Settings, Trash2 } from "lucide-react-native";
import {
  deleteProduct,
  fetchProducts,
  formatMoney,
  normalizeProduct,
  Product,
} from "../../lib/marketplace";

const tabs = ["Active", "Sold", "Drafts"] as const;

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoaded: userIsLoaded, isSignedIn } = useUser();
  const { signOut, isLoaded: authIsLoaded } = useAuth();

  const isLoaded = userIsLoaded && authIsLoaded;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("Active");

  // Safer redirect
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      const timer = setTimeout(() => router.replace("/auth/sign-in"), 5);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch products
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      if (isLoaded) setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const email = user.primaryEmailAddress?.emailAddress?.trim() || "";
    const userHandle =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      (user.primaryEmailAddress?.emailAddress?.split("@")[0] || "").trim() ||
      "Seller";

    const normalizedHandle = userHandle.toLowerCase();

    fetchProducts()
      .then((items: any[] = []) => {
        if (!mounted) return;
        const ownedItems = items.filter((item: any) => {
          if (!item) return false;
          const sellerName = (item.sellerName || "").trim().toLowerCase();
          const sellerId = String(item.sellerId || "").trim();
          const sellerEmail = (item.sellerEmail || "").trim().toLowerCase();

          return (
            sellerId === user.id ||
            (email && sellerEmail === email.toLowerCase()) ||
            (normalizedHandle && sellerName === normalizedHandle)
          );
        });

        setProducts(ownedItems.map((item: any) => normalizeProduct(item)));
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        Alert.alert("Error", "Failed to load your listings. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, user]);

  const userInfo = useMemo(() => {
    if (!user) {
      return {
        name: "Seller",
        email: "Email not available",
        avatar: DEFAULT_AVATAR,
        joined: "N/A",
      };
    }
    return {
      name:
        user.fullName?.trim() ||
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.primaryEmailAddress?.emailAddress?.split("@")[0]?.trim() ||
        "Seller",
      email: user.primaryEmailAddress?.emailAddress || "Email not available",
      avatar: user.imageUrl || DEFAULT_AVATAR,
      joined: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    };
  }, [user]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status !== "DRAFT").length;
    const sold = products.filter((p) => p.status === "SOLD").length;
    const drafts = products.filter((p) => p.status === "DRAFT").length;
    return { active, sold, drafts };
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (selectedTab === "Drafts")
      return products.filter((p) => p.status === "DRAFT");
    if (selectedTab === "Sold")
      return products.filter((p) => p.status === "SOLD");
    return products.filter((p) => p.status !== "DRAFT");
  }, [products, selectedTab]);

  const handleDelete = useCallback(async (item: Product) => {
    Alert.alert(
      "Delete listing?",
      "This will remove the listing from the marketplace.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(item._id);
              setProducts((prev) => prev.filter((p) => p._id !== item._id));
            } catch (error: any) {
              Alert.alert(
                "Delete failed",
                error?.message || "Unable to delete listing.",
              );
            }
          },
        },
      ],
    );
  }, []);

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.userRow}>
              <Image
                source={{ uri: userInfo.avatar }}
                style={styles.avatar}
                onError={() => console.warn("Avatar load failed")}
              />
              <View>
                <Text style={styles.helloText}>{userInfo.name}</Text>
                <Text style={styles.subText}>Seller</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => router.push("/notifications")}
              >
                <Bell size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => router.push("/settings")}
              >
                <Settings size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileMeta}>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
            <Text style={styles.profileJoined}>Joined {userInfo.joined}</Text>
          </View>

          <View style={styles.statRow}>
            <StatCard value={stats.active} label="Active" />
            <StatCard value={stats.sold} label="Sold" />
            <StatCard value={stats.drafts} label="Drafts" />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={styles.tabItem}
              >
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab}
                </Text>
                {isActive ? (
                  <View style={styles.tabUnderline} />
                ) : (
                  <View style={styles.tabPlaceholder} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Listings */}
        <View style={styles.listWrap}>
          {visibleProducts.length > 0 ? (
            visibleProducts.slice(0, 6).map((item) => (
              <View key={item._id} style={styles.listCard}>
                <Image
                  source={{ uri: item.image || DEFAULT_AVATAR }}
                  style={styles.listImage}
                  onError={(e) =>
                    console.warn("Failed to load product image:", item.image)
                  }
                />
                <View style={styles.listBody}>
                  <View style={styles.listTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {item.listingTitle ||
                          `${item.year || ""} ${item.brand || ""} ${item.model || ""}`.trim()}
                      </Text>
                      <Text style={styles.listPrice}>
                        {formatMoney(item.price)}
                      </Text>
                    </View>
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>
                        {item.status === "SOLD" ? "SOLD" : "LIVE"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.listStats}>
                    {item.views || 0} views • {item.saves || 0} saves •{" "}
                    {item.inquiries || 0} inquiries
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push({
                          pathname: "/create",
                          params: { id: item._id },
                        } as any)
                      }
                    >
                      <Edit3 size={14} color="#667085" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Trash2 size={14} color="#D92D20" />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyText}>
                Create your first listing and it will appear here under your
                account.
              </Text>
            </View>
          )}
        </View>

        {/* Performance Insights */}
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            Your listings outperform <Text style={styles.highlight}>78%</Text>{" "}
            of similar vehicles
          </Text>

          <View style={styles.insightGrid}>
            <Metric
              label="Views"
              value={`${products.reduce((sum, item) => sum + (item.views || 0), 0)}`}
            />
            <Metric
              label="Saves"
              value={`${products.reduce((sum, item) => sum + (item.saves || 0), 0)}`}
            />
            <Metric
              label="Inquiries"
              value={`${products.reduce((sum, item) => sum + (item.inquiries || 0), 0)}`}
            />
          </View>

          <View style={styles.responseRow}>
            <Text style={styles.responseLabel}>Avg. response time</Text>
            <Text style={styles.responseValue}>1.2 hrs</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await signOut();
              router.replace("/auth/sign-in");
            } catch (e) {
              console.error("Sign out failed", e);
            }
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Components
function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

// Styles
const styles = {
  screen: { flex: 1, backgroundColor: "#F6F7FB" as const },
  content: { paddingBottom: 120 },
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  header: {
    backgroundColor: "#2F64FF",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  userRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  helloText: { color: "#fff", fontSize: 18, fontWeight: "900" as const },
  subText: { color: "rgba(255,255,255,0.84)", marginTop: 3, fontSize: 13 },

  profileMeta: { marginTop: 14, paddingHorizontal: 4 },
  profileEmail: {
    color: "rgba(255,255,255,0.94)",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  profileJoined: { color: "rgba(255,255,255,0.8)", marginTop: 4, fontSize: 12 },

  headerActions: { flexDirection: "row" as const, gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  statRow: { flexDirection: "row" as const, gap: 10, marginTop: 18 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: { color: "#fff", fontSize: 24, fontWeight: "900" as const },
  statLabel: {
    color: "rgba(255,255,255,0.86)",
    marginTop: 4,
    fontWeight: "600" as const,
  },

  tabRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 18,
  },
  tabItem: { paddingBottom: 10 },
  tabLabel: { color: "#667085", fontSize: 15, fontWeight: "700" as const },
  tabLabelActive: { color: "#2F64FF" },
  tabUnderline: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "#2F64FF",
    marginTop: 6,
    width: 28,
  },
  tabPlaceholder: { height: 3, marginTop: 6, width: 28 },

  listWrap: { paddingHorizontal: 16, marginTop: 8, gap: 12 },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    flexDirection: "row" as const,
    gap: 12,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  listImage: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: "#EEF2F6",
  },
  listBody: { flex: 1 },
  listTopRow: {
    flexDirection: "row" as const,
    gap: 10,
    alignItems: "flex-start" as const,
  },
  listTitle: { fontSize: 16, fontWeight: "900" as const, color: "#101828" },
  listPrice: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900" as const,
    color: "#2F64FF",
  },
  liveBadge: {
    backgroundColor: "#E7F8EC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveBadgeText: { color: "#12B76A", fontSize: 11, fontWeight: "900" as const },
  listStats: { marginTop: 8, color: "#667085", fontSize: 12 },

  actionRow: { flexDirection: "row" as const, gap: 16, marginTop: 12 },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  actionText: { color: "#667085", fontWeight: "700" as const },
  deleteButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  deleteText: { color: "#D92D20", fontWeight: "700" as const },

  sectionTitle: {
    marginTop: 24,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "900" as const,
    color: "#101828",
  },
  insightCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  insightText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#101828",
    lineHeight: 22,
  },
  highlight: { color: "#2F64FF" },
  insightGrid: { flexDirection: "row" as const, gap: 10, marginTop: 18 },
  metric: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 12,
  },
  metricLabel: { fontSize: 12, color: "#667085", fontWeight: "700" as const },
  metricValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "900" as const,
    color: "#101828",
  },
  responseRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 16,
  },
  responseLabel: { color: "#667085", fontWeight: "700" as const },
  responseValue: { color: "#12B76A", fontSize: 16, fontWeight: "900" as const },

  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center" as const,
  },
  emptyTitle: { fontSize: 16, fontWeight: "900" as const, color: "#101828" },
  emptyText: {
    marginTop: 8,
    color: "#667085",
    textAlign: "center" as const,
    lineHeight: 20,
  },

  logoutButton: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#101828",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center" as const,
  },
  logoutText: { color: "#fff", fontWeight: "900" as const, fontSize: 16 },
};
