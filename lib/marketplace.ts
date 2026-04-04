export type Product = {
  _id: string;
  image: string;
  text: string;
  price: number;
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  condition?: string;
  transmission?: string;
  location?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  category: string;
  featured?: boolean;
  status?: string;
  views?: number;
  saves?: number;
  inquiries?: number;
  sellerName?: string;
  sellerAvatar?: string;
  sellerVerified?: boolean;
  sellerSince?: string;
  aiSummary?: string;
  estimatedMileage?: string;
  estimatedCondition?: string;
  estimatedPriceBand?: string;
  keySpecifications?: string[];
  topFeatures?: string[];
  standOutFeatures?: string[];
  listingTitle?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  type?: string;
  productId?: string;
  productImage?: string;
  productTitle?: string;
  readBy?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = Partial<Product> & {
  image?: string;
  price: number | string;
  brand: string;
  model: string;
  category: string;
};

const BASE_URL = (
  process.env.EXPO_PUBLIC_BASE_URL || "https://ride-rel-backend.onrender.com"
).replace(/\/$/, "");

if (!BASE_URL || BASE_URL === "") {
  console.error("⚠️ BASE_URL not configured - API calls will fail");
}

const API = (path: string) => {
  if (!BASE_URL) throw new Error("API_URL not configured");
  return `${BASE_URL}${path}`;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string[];
  fuelType?: string[];
  transmission?: string[];
  location?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  mileageMax?: string;
  featured?: boolean;
  sellerId?: string;
  sellerEmail?: string;
};

export const formatMoney = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "\u20B90";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const formatPriceBand = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "\u20B90 - \u20B90";

  const lower = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);

  const upper = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(numeric * 1.08));

  return `${lower} - ${upper}`;
};

export const formatMileage = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Mileage not listed";
  return `${numeric.toLocaleString()} mi`;
};

export const formatYear = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) && numeric > 0 ? `${numeric}` : "2023";
};

export const normalizeProduct = (product: Partial<Product> = {}): Product => ({
  _id: product._id || `${product.brand || "demo"}-${product.model || "item"}`,
  image:
    product.image ||
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  text:
    product.text ||
    `${product.brand || "Premium"} ${product.model || "vehicle"} in great condition.`,
  price: Number(product.price || 0),
  brand: product.brand || "BMW",
  model: product.model || "M4",
  year: product.year || 2023,
  mileage: product.mileage || 4200,
  fuelType: product.fuelType || "Petrol",
  condition: product.condition || "Excellent",
  transmission: product.transmission || "Automatic",
  location:
    product.location ||
    [product.village, product.taluk, product.district, product.state]
      .filter(Boolean)
      .join(", ") ||
    "Bengaluru, Karnataka",
  state: product.state || "Karnataka",
  district: product.district || "Bengaluru Urban",
  taluk: product.taluk || "Bengaluru South",
  village: product.village || "Koramangala",
  pincode: product.pincode || "560001",
  category: product.category || "car",
  featured: product.featured ?? false,
  status: product.status || "LIVE",
  views: product.views || 0,
  saves: product.saves || 0,
  inquiries: product.inquiries || 0,
  sellerName: product.sellerName || "James K.",
  sellerAvatar: product.sellerAvatar,
  sellerVerified: product.sellerVerified ?? true,
  sellerSince: product.sellerSince || "Member since 2021",
  aiSummary:
    product.aiSummary ||
    "Well-maintained vehicle with a clean service history and polished presentation.",
  estimatedMileage:
    product.estimatedMileage ||
    (product.mileage ? formatMileage(product.mileage) : "4,200 mi"),
  estimatedCondition: product.estimatedCondition || "Excellent",
  estimatedPriceBand:
    product.estimatedPriceBand || formatPriceBand(product.price),
  keySpecifications: product.keySpecifications || [
    formatYear(product.year),
    formatMileage(product.mileage),
    product.fuelType || "Petrol",
    product.transmission || "Automatic",
  ],
  topFeatures: product.topFeatures || [
    "Full service history",
    "Clean interior",
    "Low ownership",
  ],
  standOutFeatures: product.standOutFeatures || [
    "Excellent condition",
    "Ready for immediate sale",
  ],
  listingTitle:
    product.listingTitle ||
    `${product.year || 2023} ${product.brand || "BMW"} ${product.model || "M4"}`,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const sampleProducts: Product[] = [
  normalizeProduct({
    _id: "demo-1",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    brand: "BMW",
    model: "M4",
    year: 2023,
    mileage: 4200,
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Excellent",
    price: 72000,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru South",
    pincode: "560001",
    category: "car",
    featured: true,
    status: "LIVE",
    views: 342,
    saves: 28,
    inquiries: 5,
    sellerName: "James K.",
    sellerSince: "Member since 2021",
    aiSummary:
      "Well-maintained sports coupe in excellent condition. Regular service history, minor cosmetic wear on rear bumper only.",
    keySpecifications: ["2023", "4,200 mi", "Petrol", "Automatic"],
  }),
  normalizeProduct({
    _id: "demo-2",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    brand: "Tesla",
    model: "Model S",
    year: 2022,
    mileage: 12800,
    fuelType: "Electric",
    transmission: "Automatic",
    condition: "Excellent",
    price: 89500,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru North",
    pincode: "560001",
    category: "car",
    featured: true,
    status: "LIVE",
    views: 218,
    saves: 14,
    inquiries: 3,
    sellerName: "James K.",
    sellerSince: "Member since 2021",
    aiSummary:
      "Luxury electric sedan with premium interior, long range, and strong software updates history.",
    keySpecifications: ["2022", "12,800 mi", "Electric", "Automatic"],
  }),
  normalizeProduct({
    _id: "demo-3",
    image:
      "https://images.unsplash.com/photo-1502904550040-7534597429a9?auto=format&fit=crop&w=1200&q=80",
    brand: "Honda",
    model: "CBR1000RR",
    year: 2021,
    mileage: 4500,
    fuelType: "Petrol",
    transmission: "Manual",
    condition: "Excellent",
    price: 29500,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru East",
    pincode: "560001",
    category: "bike",
    featured: false,
    views: 342,
    saves: 18,
    inquiries: 6,
    sellerName: "Mike D.",
    sellerSince: "Member since 2022",
    aiSummary:
      "Track-focused superbike with aggressive styling and a clean title.",
  }),
  normalizeProduct({
    _id: "demo-4",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    brand: "Yamaha",
    model: "MT-09",
    year: 2022,
    mileage: 1200,
    fuelType: "Petrol",
    transmission: "Manual",
    condition: "Excellent",
    price: 11800,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru South",
    pincode: "560001",
    category: "bike",
    featured: false,
    views: 190,
    saves: 10,
    inquiries: 2,
    sellerName: "Alex P.",
    sellerSince: "Member since 2020",
    aiSummary:
      "Lightweight naked bike with quick handling and fresh maintenance.",
  }),
  normalizeProduct({
    _id: "demo-5",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    brand: "Ford",
    model: "Mustang GT500",
    year: 2020,
    mileage: 18400,
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Very Good",
    price: 68000,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru East",
    pincode: "560001",
    category: "car",
    featured: false,
    views: 126,
    saves: 8,
    inquiries: 2,
    sellerName: "Jordan S.",
    sellerSince: "Member since 2019",
    aiSummary:
      "Muscle car with strong presence, sharp styling, and clean ownership records.",
  }),
  normalizeProduct({
    _id: "demo-6",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    brand: "Porsche",
    model: "911 Carrera",
    year: 2023,
    mileage: 4200,
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Excellent",
    price: 127000,
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: "Bengaluru South",
    pincode: "560001",
    category: "car",
    featured: true,
    status: "LIVE",
    views: 420,
    saves: 34,
    inquiries: 9,
    sellerName: "James K.",
    sellerSince: "Member since 2021",
    aiSummary:
      "Well-maintained sports car with a spotless cabin, regular service history, and premium specification.",
    keySpecifications: ["2023", "4,200 mi", "Petrol", "Automatic"],
  }),
];

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.category && filters.category !== "All")
      params.set("category", filters.category);
    if (filters.minPrice && filters.minPrice !== "0")
      params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.brand?.length) params.set("brand", filters.brand.join(","));
    if (filters.fuelType?.length)
      params.set("fuelType", filters.fuelType.join(","));
    if (filters.transmission?.length)
      params.set("transmission", filters.transmission.join(","));
    if (filters.location) params.set("location", filters.location);
    if (filters.mileageMax) params.set("mileageMax", filters.mileageMax);
    if (filters.featured) params.set("featured", "true");
    if (filters.sellerId) params.set("sellerId", filters.sellerId);
    if (filters.sellerEmail) params.set("sellerEmail", filters.sellerEmail);

    const query = params.toString();
    const response = await fetch(
      API(`/api/products${query ? `?${query}` : ""}`),
    );
    const json = await response.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    const hasFilters = Object.keys(filters).some((key) => {
      const value = (filters as Record<string, unknown>)[key];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

    if (!data.length) return hasFilters ? [] : sampleProducts;
    return data.map((item: Product) => normalizeProduct(item));
  } catch {
    return Object.keys(filters).length ? [] : sampleProducts;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(API(`/api/products/${id}`));

    if (!response.ok) {
      console.error(`Product fetch failed: ${response.status}`);
      return sampleProducts.find((item) => item._id === id) || null;
    }

    const json = await response.json();
    return normalizeProduct(json?.data || {});
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return sampleProducts.find((item) => item._id === id) || null;
  }
}

export async function createProduct(formData: FormData) {
  const response = await fetch(API("/api/products/create"), {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || json?.message || "Create failed");
  }

  return json?.data;
}

export async function updateProduct(
  id: string,
  body: FormData | Record<string, string>,
) {
  const response = await fetch(API(`/api/products/${id}`), {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
    headers:
      body instanceof FormData
        ? undefined
        : { "Content-Type": "application/json" },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Update failed");
  }

  return json?.data;
}

export async function deleteProduct(id: string) {
  const response = await fetch(API(`/api/products/${id}`), {
    method: "DELETE",
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Delete failed");
  }
  return json;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const response = await fetch(API("/api/notifications"));
    const json = await response.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    return data;
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string, userId?: string) {
  try {
    const response = await fetch(API(`/api/notifications/${id}/read`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const json = await response.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export function buildAnalysisDraft(input: {
  brand: string;
  model: string;
  year?: string;
  mileage?: string;
  condition?: string;
  location?: string;
}) {
  const brand = input.brand || "Vehicle";
  const model = input.model || "listing";
  const year = input.year || "2023";
  const mileage = input.mileage || "4,200 mi";
  const condition = input.condition || "Excellent";
  const location = input.location || "Bengaluru, Karnataka";

  return {
    headline: `${brand} ${model} looks ready to list`,
    overview: `Well-presented ${year} ${brand} ${model} in ${condition.toLowerCase()} condition. Typical buyer interest is strongest for clean examples with service records and low miles.`,
    mileage,
    condition: `Condition: ${condition}`,
    priceBand: "Estimated range: \u20B968,000 - \u20B974,000",
    location,
  };
}
