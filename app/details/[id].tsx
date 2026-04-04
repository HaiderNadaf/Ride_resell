import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  ArrowLeft,
  MessageSquare,
  PhoneCall,
  BadgeCheck,
} from "lucide-react-native";
import {
  fetchProductById,
  formatMoney,
  formatMileage,
  Product,
  normalizeProduct,
} from "../../lib/marketplace";

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    fetchProductById(String(id))
      .then((item) => {
        if (mounted && item) setProduct(normalizeProduct(item));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    await Share.share({
      message: `${product.year} ${product.brand} ${product.model} - ${formatMoney(product.price)}`,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#667085" }}>No details found.</Text>
      </SafeAreaView>
    );
  }

  const details = [
    ["Year", `${product.year || "2023"}`],
    ["Make", product.brand],
    ["Model", product.model],
    ["Mileage", formatMileage(product.mileage)],
    ["Fuel Type", product.fuelType || "Petrol"],
    ["Transmission", product.transmission || "Automatic"],
    ["Location", product.location || "Bengaluru, Karnataka"],
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.heroImage}
            onError={(error) => {
              console.warn(
                "Failed to load product image:",
                product.image,
                error,
              );
            }}
          />
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={handleShare}>
              <Heart size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.dotRow}>
            <View style={styles.dotActive} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.titleCard}>
          <Text style={styles.title}>
            {product.year} {product.brand} {product.model}
          </Text>
          <Text style={styles.subtitle}>
            {product.listingTitle ||
              `${product.year} ${product.brand} ${product.model}`}
          </Text>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
          <View style={styles.chipRow}>
            <Chip label={`${product.year || "2023"}`} />
            <Chip label={formatMileage(product.mileage)} />
            <Chip label={product.fuelType || "Petrol"} />
            <Chip label={product.transmission || "Automatic"} />
          </View>
        </View>

        <View style={styles.aiCard}>
          <Text style={styles.aiHeader}>AI Analysis</Text>
          <Text style={styles.aiText}>{product.aiSummary || product.text}</Text>
          <View style={styles.analysisFooter}>
            <Chip
              label={
                product.estimatedCondition || product.condition || "Excellent"
              }
              filled
            />
            <Text style={styles.analysisLink}>Edit</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Key Details</Text>
        <View style={styles.tableCard}>
          {details.map(([label, value]) => (
            <View key={label} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Seller Information</Text>
        <View style={styles.sellerCard}>
          <View style={styles.sellerTop}>
            <View style={styles.sellerInfo}>
              <Image
                source={{
                  uri: product.sellerAvatar || "",
                }}
                style={styles.sellerAvatar}
              />
              <View>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>
                    {product.sellerName || "James K."}
                  </Text>
                  {product.sellerVerified !== false ? (
                    <BadgeCheck size={14} color="#2F64FF" />
                  ) : null}
                </View>
                <Text style={styles.sellerSince}>
                  {product.sellerSince || "Member since 2021"}
                </Text>
              </View>
            </View>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                Alert.alert(
                  "Call Seller",
                  "Call action can be wired to your CRM or phone link.",
                )
              }
            >
              <PhoneCall size={16} color="#101828" />
              <Text style={styles.secondaryButtonText}>Call Seller</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                Alert.alert(
                  "Chat Now",
                  "Chat integration can be connected next.",
                )
              }
            >
              <MessageSquare size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Chat Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.offerButton}
          onPress={() =>
            Alert.alert(
              "Make Offer",
              "Offer flow can be connected to backend next.",
            )
          }
        >
          <Text style={styles.offerText}>Make Offer</Text>
        </TouchableOpacity>

        <View style={{ height: 42 }} />
      </ScrollView>
    </View>
  );
}

function Chip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <View style={[styles.chip, filled && styles.chipFilled]}>
      <Text style={[styles.chipText, filled && styles.chipTextFilled]}>
        {label}
      </Text>
    </View>
  );
}

const styles = {
  screen: { flex: 1, backgroundColor: "#F6F7FB" as const },
  content: { paddingBottom: 24 },
  center: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  heroWrap: { position: "relative" as const },
  heroImage: { width: "100%", height: 300 },
  heroOverlay: {
    position: "absolute" as const,
    top: 18,
    left: 16,
    right: 16,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16,24,40,0.35)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  dotRow: {
    position: "absolute" as const,
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 18,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  titleCard: {
    marginTop: -24,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "900" as const, color: "#101828" },
  subtitle: {
    marginTop: 4,
    color: "#667085",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  price: {
    marginTop: 8,
    color: "#2F64FF",
    fontSize: 26,
    fontWeight: "900" as const,
  },
  chipRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: "#F2F4F7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipFilled: { backgroundColor: "#EEF4FF" },
  chipText: { color: "#344054", fontSize: 12, fontWeight: "700" as const },
  chipTextFilled: { color: "#2F64FF" },
  aiCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#EEF4FF",
    borderRadius: 20,
    padding: 16,
  },
  aiHeader: {
    color: "#2F64FF",
    fontSize: 14,
    fontWeight: "900" as const,
    marginBottom: 10,
  },
  aiText: { color: "#344054", lineHeight: 22 },
  analysisFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 14,
  },
  analysisLink: { color: "#2F64FF", fontWeight: "700" as const },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
    color: "#101828",
    fontSize: 18,
    fontWeight: "900" as const,
  },
  tableCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  tableRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  tableLabel: { color: "#98A2B3", fontWeight: "700" as const },
  tableValue: {
    color: "#101828",
    fontWeight: "900" as const,
    maxWidth: "55%",
    textAlign: "right" as const,
  },
  sellerCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sellerTop: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  sellerInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  sellerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  sellerNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  sellerName: { color: "#101828", fontSize: 16, fontWeight: "900" as const },
  sellerSince: { marginTop: 3, color: "#667085", fontSize: 12 },
  ratingPill: {
    backgroundColor: "#FFF8E8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ratingText: { color: "#B54708", fontWeight: "900" as const },
  actionRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  secondaryButtonText: { color: "#101828", fontWeight: "800" as const },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2F64FF",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "800" as const },
  offerButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#101828",
    borderRadius: 14,
    height: 52,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  offerText: { color: "#fff", fontWeight: "900" as const, fontSize: 16 },
};
