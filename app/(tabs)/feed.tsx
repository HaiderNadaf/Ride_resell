import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import {
  fetchProducts,
  formatMoney,
  normalizeProduct,
  Product,
} from "../../lib/marketplace";

const vehicleTypes = ["All", "Cars", "Bikes", "EVs", "Trucks"];
const brandFilters = ["Car", "Bike", "EV", "Electric Bike", "Electric Car"];
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
const transmissionTypes = ["Automatic", "Manual"];

export default function SearchFilterScreen() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>(
    [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((items) => {
        if (mounted) setCatalog(items.map((item) => normalizeProduct(item)));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!catalog.length) return [];

    const search = query.trim().toLowerCase();
    const min = priceRange[0];
    const max = priceRange[1];

    return catalog.filter((item) => {
      const brand = normalizeText(item.brand);
      const model = normalizeText(item.model);
      const category = normalizeText(item.category);
      const fuelType = normalizeText(item.fuelType);
      const transmission = normalizeText(item.transmission);
      const location = normalizeText(item.location);
      const listing = normalizeText(
        item.listingTitle || `${item.year} ${item.brand} ${item.model}`,
      );
      const description = normalizeText(item.text);
      const itemPrice = numericValue(item.price);

      const matchesVehicle = matchesVehicleCategory(
        item.category,
        selectedVehicle,
      );
      const matchesSearch =
        !search ||
        [brand, model, category, location, listing, description].some((value) =>
          value.includes(search),
        );
      const matchesPrice =
        (min === 0 || itemPrice >= min) && (max === 0 || itemPrice <= max);
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some((selected) => matchesBrandFilter(item, selected));
      const matchesFuel =
        selectedFuel.length === 0 ||
        selectedFuel.some((selected) => normalizeText(selected) === fuelType);
      const matchesTransmission =
        selectedTransmission.length === 0 ||
        selectedTransmission.some(
          (selected) => normalizeText(selected) === transmission,
        );

      return (
        matchesVehicle &&
        matchesSearch &&
        matchesPrice &&
        matchesBrand &&
        matchesFuel &&
        matchesTransmission
      );
    });
  }, [
    catalog,
    query,
    selectedVehicle,
    selectedBrands,
    selectedFuel,
    selectedTransmission,
    priceRange,
  ]);

  const resultCount = results.length;

  const priceLimit = useMemo(() => {
    const highest = catalog.reduce(
      (max, item) => Math.max(max, numericValue(item.price)),
      0,
    );
    return Math.max(highest, 1000000);
  }, [catalog]);

  useEffect(() => {
    setPriceRange(([min, max]) => {
      const safeMin = clamp(min, 0, priceLimit);
      const safeMax = clamp(max || priceLimit, 0, priceLimit);
      return [Math.min(safeMin, safeMax), Math.max(safeMin, safeMax)];
    });
  }, [priceLimit]);

  const setSingleValue = (value: string, setter: (next: string[]) => void) => {
    setter([value]);
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedVehicle("All");
    setSelectedBrands([]);
    setSelectedFuel([]);
    setSelectedTransmission([]);
    setPriceRange([0, priceLimit]);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#101828" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search & Filter</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color="#98A2B3" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search listings"
          placeholderTextColor="#98A2B3"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.resultsCount}>{resultCount} results found</Text>

      <SectionTitle title="Vehicle Type" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rowScroll}
      >
        {vehicleTypes.map((item) => {
          const active = selectedVehicle === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedVehicle(item)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionTitle title="Price Range" />
      <View style={styles.rangeCard}>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabelText}>
            {formatMoney(priceRange[0])}
          </Text>
          <Text style={styles.rangeLabelText}>
            {formatMoney(priceRange[1])}
          </Text>
        </View>
        <RangeSlider
          minimumValue={0}
          maximumValue={priceLimit}
          value={priceRange}
          onChange={setPriceRange}
        />
        <Text style={styles.rangeHint}>
          Showing results from {formatMoney(priceRange[0])} to{" "}
          {formatMoney(priceRange[1])}
        </Text>
      </View>

      <SectionTitle title="Brand" />
      <View style={styles.gridWrap}>
        {brandFilters.map((brand) => {
          const active = selectedBrands.includes(brand);
          return (
            <TouchableOpacity
              key={brand}
              onPress={() => setSingleValue(brand, setSelectedBrands)}
              style={[styles.checkItem, active && styles.checkItemActive]}
            >
              <View
                style={[styles.checkDot, active && styles.checkDotActive]}
              />
              <Text
                style={[styles.checkText, active && styles.checkTextActive]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionTitle title="Fuel Type" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rowScroll}
      >
        {fuelTypes.map((item) => {
          const active = selectedFuel.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setSingleValue(item, setSelectedFuel)}
              style={[styles.smallPill, active && styles.smallPillActive]}
            >
              <Text
                style={[
                  styles.smallPillText,
                  active && styles.smallPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionTitle title="Transmission" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rowScroll}
      >
        {transmissionTypes.map((item) => {
          const active = selectedTransmission.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setSingleValue(item, setSelectedTransmission)}
              style={[styles.smallPill, active && styles.smallPillActive]}
            >
              <Text
                style={[
                  styles.smallPillText,
                  active && styles.smallPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionTitle title="Results" />
    </>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={loading ? [] : results}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={results.length > 1 ? styles.resultsRow : undefined}
        keyboardShouldPersistTaps="always" // ✅ FIX
        ListHeaderComponent={<>{renderHeader()}</>} // ✅ FIX
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#2F64FF" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptyText}>
                Try widening the price range or clearing a filter to see more
                results.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.showButton} onPress={() => {}}>
            <Text style={styles.showButtonText}>
              Show {Math.max(resultCount, 1)} Results
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => router.push(`/details/${item._id}`)}
            activeOpacity={0.92}
          >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <Text style={styles.resultTitle} numberOfLines={2}>
              {item.listingTitle || `${item.year} ${item.brand} ${item.model}`}
            </Text>
            <Text style={styles.resultPrice}>
              From {formatMoney(item.price)}
            </Text>
            <View style={styles.resultFooter}>
              <Text style={styles.resultLink}>View Details</Text>
              <Text style={styles.resultArrow}>-&gt;</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function RangeSlider({
  minimumValue,
  maximumValue,
  value,
  onChange,
}: {
  minimumValue: number;
  maximumValue: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const minStart = useRef(0);
  const maxStart = useRef(0);
  const range = Math.max(maximumValue - minimumValue, 1);
  const minPosition = trackWidth
    ? ((value[0] - minimumValue) / range) * trackWidth
    : 0;
  const maxPosition = trackWidth
    ? ((value[1] - minimumValue) / range) * trackWidth
    : 0;

  const updateFromPosition = (position: number, handle: "min" | "max") => {
    if (!trackWidth) return;

    const nextValue = clamp(
      Math.round(
        (clamp(position, 0, trackWidth) / trackWidth) * range + minimumValue,
      ),
      minimumValue,
      maximumValue,
    );

    if (handle === "min") {
      onChange([Math.min(nextValue, value[1]), value[1]]);
      return;
    }

    onChange([value[0], Math.max(nextValue, value[0])]);
  };

  const handleTrackPress = (position: number) => {
    if (!trackWidth) return;
    const distanceToMin = Math.abs(position - minPosition);
    const distanceToMax = Math.abs(position - maxPosition);
    updateFromPosition(
      position,
      distanceToMin <= distanceToMax ? "min" : "max",
    );
  };

  const minPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      minStart.current = minPosition;
    },
    onPanResponderMove: (_, gestureState) => {
      updateFromPosition(minStart.current + gestureState.dx, "min");
    },
  });

  const maxPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      maxStart.current = maxPosition;
    },
    onPanResponderMove: (_, gestureState) => {
      updateFromPosition(maxStart.current + gestureState.dx, "max");
    },
  });

  const fillLeft = Math.min(minPosition, maxPosition);
  const fillRight = Math.max(minPosition, maxPosition);

  return (
    <Pressable
      style={styles.sliderTrack}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      onPress={(event) => handleTrackPress(event.nativeEvent.locationX)}
    >
      <View
        style={[
          styles.sliderFill,
          {
            left: fillLeft,
            width: Math.max(fillRight - fillLeft, 0),
          },
        ]}
      />
      <View
        style={[styles.sliderThumb, { left: Math.max(minPosition - 12, 0) }]}
        {...minPan.panHandlers}
      >
        <View style={styles.sliderThumbInner} />
      </View>
      <View
        style={[styles.sliderThumb, { left: Math.max(maxPosition - 12, 0) }]}
        {...maxPan.panHandlers}
      >
        <View style={styles.sliderThumbInner} />
      </View>
    </Pressable>
  );
}

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function numericValue(value: string | number) {
  const digits = Number(String(value).replace(/[^0-9]/g, ""));
  return Number.isFinite(digits) ? digits : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function matchesVehicleCategory(category: string, selected: string) {
  const normalized = normalizeText(category);
  if (selected === "All") return true;
  if (selected === "Cars") return normalized.includes("car");
  if (selected === "Bikes") return normalized.includes("bike");
  if (selected === "EVs") return normalized.includes("electric");
  if (selected === "Trucks") return normalized.includes("truck");
  return true;
}

function matchesBrandFilter(item: Product, selected: string) {
  const category = normalizeText(item.category);
  const fuelType = normalizeText(item.fuelType);
  const title = normalizeText(item.listingTitle);
  const body = `${category} ${fuelType} ${title}`;
  const brand = normalizeText(item.brand);
  const filter = normalizeText(selected);

  if (filter === "car")
    return body.includes("car") && !body.includes("electric");
  if (filter === "bike")
    return body.includes("bike") && !body.includes("electric");
  if (filter === "ev") return body.includes("electric");
  if (filter === "electric bike")
    return body.includes("electric") && body.includes("bike");
  if (filter === "electric car")
    return body.includes("electric") && body.includes("car");

  return brand === filter;
}

const styles = {
  screen: { flex: 1, backgroundColor: "#FFFFFF" as const },
  content: { paddingHorizontal: 16, paddingBottom: 120 },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#F2F4F7",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: "#101828" },
  resetText: { fontSize: 15, fontWeight: "700" as const, color: "#2F64FF" },
  searchBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F2F4F7",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#101828" },
  resultsCount: { marginTop: 10, color: "#667085", fontSize: 13 },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: "#101828",
    fontSize: 16,
    fontWeight: "800" as const,
  },
  rowScroll: { minHeight: 42 },
  pill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F4F7",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 10,
  },
  pillActive: { backgroundColor: "#101828" },
  pillText: { color: "#344054", fontWeight: "700" as const },
  pillTextActive: { color: "#fff" },
  rangeCard: {
    backgroundColor: "#FBFCFE",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  rangeLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  rangeLabelText: {
    color: "#344054",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  rangeHint: {
    marginTop: 12,
    color: "#667085",
    fontSize: 12,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E4E7EC",
    position: "relative" as const,
    marginTop: 10,
  },
  sliderFill: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "#2F64FF",
  },
  sliderThumb: {
    position: "absolute" as const,
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#2F64FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2F64FF",
  },
  gridWrap: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  checkItem: {
    width: "48%",
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    paddingHorizontal: 12,
    alignItems: "center" as const,
    flexDirection: "row" as const,
    gap: 10,
    backgroundColor: "#fff",
  },
  checkItemActive: { borderColor: "#2F64FF", backgroundColor: "#EEF4FF" },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#98A2B3",
  },
  checkDotActive: {
    backgroundColor: "#2F64FF",
    borderColor: "#2F64FF",
  },
  checkText: { color: "#344054", fontWeight: "700" as const },
  checkTextActive: { color: "#101828" },
  smallPill: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F4F7",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 10,
  },
  smallPillActive: { backgroundColor: "#EEF4FF" },
  smallPillText: { color: "#344054", fontWeight: "700" as const },
  smallPillTextActive: { color: "#2F64FF" },
  resultsRow: {
    justifyContent: "space-between" as const,
    gap: 12,
  },
  resultCard: {
    width: "48%" as any,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    padding: 10,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 12,
  },
  resultImage: {
    width: "100%" as any,
    height: 92,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: "#101828",
    minHeight: 40,
  },
  resultPrice: {
    marginTop: 6,
    color: "#667085",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  resultFooter: {
    marginTop: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  resultLink: {
    color: "#F28C28",
    fontSize: 14,
    fontWeight: "800" as const,
  },
  resultArrow: {
    color: "#F28C28",
    fontSize: 15,
    fontWeight: "900" as const,
    marginTop: -1,
  },
  emptyState: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FBFCFE",
    borderWidth: 1,
    borderColor: "#EEF2F6",
    alignItems: "center" as const,
    marginTop: 8,
  },
  emptyTitle: { color: "#101828", fontWeight: "900" as const, fontSize: 16 },
  emptyText: {
    marginTop: 8,
    color: "#667085",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  showButton: {
    marginTop: 16,
    backgroundColor: "#2F64FF",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center" as const,
  },
  showButtonText: { color: "#fff", fontWeight: "800" as const, fontSize: 16 },
  loadingWrap: { marginTop: 180, alignItems: "center" as const },
};
