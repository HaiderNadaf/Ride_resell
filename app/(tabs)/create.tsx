import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import { ArrowLeft, ChevronRight, Upload, User } from "lucide-react-native";
import {
  createProduct,
  fetchProductById,
  Product,
  updateProduct,
} from "../../lib/marketplace";
import {
  fetchIndiaDistricts,
  fetchIndiaStates,
  fetchIndiaTalukas,
  fetchIndiaVillages,
} from "../../lib/indiaLocation";

const vehicleTypeOptions = [
  { label: "Select type", value: "" },
  { label: "Car", value: "car" },
  { label: "Bike", value: "bike" },
  { label: "Scooter", value: "scooter" },
  { label: "Electric Car", value: "electric-car" },
  { label: "Electric Bike", value: "electric-bike" },
  { label: "Electric Scooter", value: "electric-scooter" },
  { label: "Truck", value: "truck" },
];

// FREE API for Indian cars (brands + models) - raw public GitHub JSON (no API key needed)
const INDIAN_CARS_JSON_URL =
  "https://raw.githubusercontent.com/deepakssn/indiancars/master/indiancars.json";

// Hard-coded popular Indian bike / scooter / EV 2-wheeler brands & models (Indian focused)
const bikeBrands = [
  { label: "Select brand", value: "" },
  { label: "Hero", value: "Hero" },
  { label: "Bajaj", value: "Bajaj" },
  { label: "TVS", value: "TVS" },
  { label: "Royal Enfield", value: "Royal Enfield" },
  { label: "Honda", value: "Honda" },
  { label: "Yamaha", value: "Yamaha" },
  { label: "Suzuki", value: "Suzuki" },
  { label: "KTM", value: "KTM" },
  { label: "Ather Energy", value: "Ather Energy" },
  { label: "Ola Electric", value: "Ola Electric" },
  { label: "Revolt", value: "Revolt" },
  { label: "Other", value: "Other" },
];

const bikeModelsByBrand: Record<string, { label: string; value: string }[]> = {
  Hero: [
    { label: "Select model", value: "" },
    { label: "Splendor Plus", value: "Splendor Plus" },
    { label: "HF Deluxe", value: "HF Deluxe" },
    { label: "Glamour", value: "Glamour" },
    { label: "Xtreme", value: "Xtreme" },
  ],
  Bajaj: [
    { label: "Select model", value: "" },
    { label: "Pulsar NS200", value: "Pulsar NS200" },
    { label: "Dominar 400", value: "Dominar 400" },
    { label: "Avenger", value: "Avenger" },
  ],
  TVS: [
    { label: "Select model", value: "" },
    { label: "Apache RTR 160", value: "Apache RTR 160" },
    { label: "Jupiter", value: "Jupiter" },
    { label: "Ntorq", value: "Ntorq" },
  ],
  "Royal Enfield": [
    { label: "Select model", value: "" },
    { label: "Classic 350", value: "Classic 350" },
    { label: "Himalayan", value: "Himalayan" },
    { label: "Meteor 350", value: "Meteor 350" },
  ],
  Honda: [
    { label: "Select model", value: "" },
    { label: "Shine", value: "Shine" },
    { label: "Activa", value: "Activa" },
    { label: "SP 125", value: "SP 125" },
  ],
  Yamaha: [
    { label: "Select model", value: "" },
    { label: "R15", value: "R15" },
    { label: "FZ", value: "FZ" },
    { label: "Ray ZR", value: "Ray ZR" },
  ],
  Suzuki: [
    { label: "Select model", value: "" },
    { label: "Access 125", value: "Access 125" },
    { label: "Gixxer", value: "Gixxer" },
  ],
  KTM: [
    { label: "Select model", value: "" },
    { label: "Duke 200", value: "Duke 200" },
    { label: "RC 200", value: "RC 200" },
  ],
  "Ather Energy": [
    { label: "Select model", value: "" },
    { label: "450X", value: "450X" },
    { label: "Rizta", value: "Rizta" },
  ],
  "Ola Electric": [
    { label: "Select model", value: "" },
    { label: "S1 Pro", value: "S1 Pro" },
    { label: "S1 Air", value: "S1 Air" },
  ],
  Revolt: [
    { label: "Select model", value: "" },
    { label: "RV400", value: "RV400" },
  ],
  Other: [{ label: "Type model", value: "Other" }],
};

const conditionOptions = [
  { label: "Select condition", value: "" },
  { label: "Excellent", value: "Excellent" },
  { label: "Very Good", value: "Very Good" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(Boolean(id));
  const [existing, setExisting] = useState<Product | null>(null);
  const [imageUri, setImageUri] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [year, setYear] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [pincode, setPincode] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [village, setVillage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  // Dynamic data from free Indian cars API
  const [carBrands, setCarBrands] = useState<
    { label: string; value: string }[]
  >([]);
  const [carModelsByBrand, setCarModelsByBrand] = useState<
    Record<string, { label: string; value: string }[]>
  >({});
  const [carDataLoaded, setCarDataLoaded] = useState(false);

  // Fetch Indian cars brands & models (free public JSON)
  useEffect(() => {
    fetch(INDIAN_CARS_JSON_URL)
      .then((res) => res.json())
      .then((data: { cars: { brand: string; model: string }[] }) => {
        const carsList = data.cars || [];
        const brandSet = new Set<string>();
        const modelsMap: Record<string, { label: string; value: string }[]> =
          {};

        carsList.forEach((item) => {
          const b = item.brand?.trim() || "";
          const m = item.model?.trim() || "";
          if (b) brandSet.add(b);
          if (b && m) {
            if (!modelsMap[b])
              modelsMap[b] = [{ label: "Select model", value: "" }];
            if (!modelsMap[b].some((opt) => opt.value === m)) {
              modelsMap[b].push({ label: m, value: m });
            }
          }
        });

        const brandsArr = [
          { label: "Select brand", value: "" },
          ...Array.from(brandSet)
            .sort((a, b) => a.localeCompare(b))
            .map((b) => ({ label: b, value: b })),
          { label: "Other", value: "Other" },
        ];

        setCarBrands(brandsArr);
        setCarModelsByBrand(modelsMap);
        setCarDataLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Indian cars data from free API:", err);
        // Fallback (won't affect UI much - user can still use "Other")
        setCarBrands([
          { label: "Select brand", value: "" },
          { label: "Other", value: "Other" },
        ]);
        setCarDataLoaded(true);
      });
  }, []);

  // Reset brand/model when vehicle type changes (cascading logic)
  useEffect(() => {
    if (vehicleType) {
      const currentBrands = getBrandsForVehicleType(vehicleType);
      const brandValues = currentBrands.map((b) => b.value).filter(Boolean);
      if (!brandValues.includes(brand)) {
        setBrand("");
        setCustomBrand("");
        setModel("");
        setCustomModel("");
      }
    }
  }, [vehicleType]);

  const getBrandsForVehicleType = (type: string) => {
    if (!type) {
      return [{ label: "Select vehicle type first", value: "" }];
    }
    if (["car", "electric-car", "truck"].includes(type)) {
      return carDataLoaded && carBrands.length > 0
        ? carBrands
        : [{ label: "Loading Indian brands...", value: "" }];
    }
    // Bike / Scooter / Electric 2-wheelers (Indian list)
    if (
      ["bike", "scooter", "electric-bike", "electric-scooter"].includes(type)
    ) {
      return bikeBrands;
    }
    return [{ label: "Select brand", value: "" }];
  };

  const getModelsForBrand = (type: string, selectedBrand: string) => {
    if (!selectedBrand) {
      return [{ label: "Select brand first", value: "" }];
    }
    if (["car", "electric-car", "truck"].includes(type)) {
      return (
        carModelsByBrand[selectedBrand] || [
          { label: "Select brand first", value: "" },
        ]
      );
    }
    if (
      ["bike", "scooter", "electric-bike", "electric-scooter"].includes(type)
    ) {
      return (
        bikeModelsByBrand[selectedBrand] || [
          { label: "Select brand first", value: "" },
        ]
      );
    }
    return [{ label: "Select brand first", value: "" }];
  };

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setInitializing(false);
      return;
    }

    fetchProductById(String(id)).then((product) => {
      if (!mounted || !product) {
        setInitializing(false);
        return;
      }

      setExisting(product);
      setImageUri(product.image);
      setTitle(
        product.listingTitle ||
          `${product.year} ${product.brand} ${product.model}`,
      );
      setPrice(String(product.price));
      setVehicleType(product.category || "car");
      setYear(String(product.year || ""));
      // Updated editing logic - works with new dynamic lists (brand/model set directly)
      setBrand(product.brand || "");
      setCustomBrand("");
      setModel(product.model || "");
      setCustomModel("");
      setMileage(String(product.mileage || ""));
      setFuelType(product.fuelType || "Petrol");
      setTransmission(product.transmission || "Automatic");
      setStateName(product.state || "");
      setDistrict(product.district || "");
      setTaluk(product.taluk || "");
      setVillage(product.village || "");
      setPincode(product.pincode || "");
      setCondition(product.condition || "Excellent");
      setDescription(product.text || "");
      setInitializing(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  // ... (all your existing India location useEffects remain 100% unchanged)
  useEffect(() => {
    let mounted = true;

    fetchIndiaStates()
      .then((items) => {
        if (!mounted) return;
        setStates(items);
      })
      .catch(() => {
        if (mounted) setStates([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (states.length && !stateName) {
      setStateName(states[0]);
    }
  }, [states, stateName]);

  useEffect(() => {
    if (!stateName) {
      setDistricts([]);
      setTaluks([]);
      setVillages([]);
      setDistrict("");
      setTaluk("");
      setVillage("");
      return;
    }

    let mounted = true;
    setLocationLoading(true);

    fetchIndiaDistricts(stateName)
      .then((items) => {
        if (!mounted) return;
        setDistricts(items);
        setDistrict(items[0] || "");
        setTaluk("");
        setVillage("");
        setTaluks([]);
        setVillages([]);
      })
      .catch(() => {
        if (mounted) {
          setDistricts([]);
          setTaluks([]);
          setVillages([]);
        }
      })
      .finally(() => {
        if (mounted) setLocationLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [stateName]);

  useEffect(() => {
    if (!district) return;

    let mounted = true;
    setLocationLoading(true);

    fetchIndiaTalukas(stateName, district)
      .then((items) => {
        if (!mounted) return;
        setTaluks(items);
        setTaluk(items[0] || "");
        setVillage("");
        setVillages([]);
      })
      .catch(() => {
        if (mounted) {
          setTaluks([]);
          setVillages([]);
        }
      })
      .finally(() => {
        if (mounted) setLocationLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [stateName, district]);

  useEffect(() => {
    if (!taluk) return;

    let mounted = true;
    setLocationLoading(true);

    fetchIndiaVillages(stateName, district, taluk)
      .then((items) => {
        if (!mounted) return;
        setVillages(items);
        setVillage(items[0] || "");
      })
      .catch(() => {
        if (mounted) setVillages([]);
      })
      .finally(() => {
        if (mounted) setLocationLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [stateName, district, taluk]);

  const sellerName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Seller";

  const sellerAvatar = user?.imageUrl || "";
  const sellerEmail = user?.primaryEmailAddress?.emailAddress || "";
  const selectedBrand = brand === "Other" ? customBrand.trim() : brand;
  const selectedModel = model === "Other" ? customModel.trim() : model;
  const composedLocation = [village, taluk, district, stateName]
    .filter(Boolean)
    .join(", ");
  const selectedStateValue = stateName;
  const selectedDistrictValue = district;
  const selectedTalukValue = taluk;
  const selectedVillageValue = village;
  const statePickerOptions = [
    { label: "Select state", value: "" },
    ...states.map((entry) => ({ label: entry, value: entry })),
  ];
  const districtPickerOptions = [
    {
      label: selectedStateValue ? "Select district" : "Select state first",
      value: "",
    },
    ...districts.map((entry) => ({ label: entry, value: entry })),
  ];
  const talukPickerOptions = [
    {
      label: selectedDistrictValue
        ? "Select taluk / area"
        : "Select district first",
      value: "",
    },
    ...taluks.map((entry) => ({ label: entry, value: entry })),
  ];
  const villagePickerOptions = [
    {
      label: selectedTalukValue ? "Select village" : "Select taluk first",
      value: "",
    },
    ...villages.map((entry) => ({ label: entry, value: entry })),
  ];

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload a listing.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!imageUri || !title.trim() || !price || !vehicleType || !year.trim()) {
      Alert.alert(
        "Missing required fields",
        "Please fill Image, Listing Title, Price, Vehicle Type, and Year.",
      );
      return;
    }

    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    // Location is now OPTIONAL
    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

    if (!userLoaded || !user) {
      Alert.alert(
        "Sign in required",
        "Please sign in before publishing a listing.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        listingTitle: title,
        price,
        category: vehicleType,
        brand: selectedBrand,
        model: selectedModel,
        year,
        mileage,
        fuelType,
        transmission,
        location: composedLocation || "Location not provided",
        state: stateName || "",
        district: district || "",
        taluk: taluk || "",
        village: village || "",
        pincode,
        condition,
        description,
        featured: "true",
        sellerName,
        sellerId: user.id,
        sellerEmail,
        sellerAvatar,
        sellerSince: user.createdAt
          ? `Member since ${new Date(user.createdAt).getFullYear()}`
          : "Member since 2021",
        sellerVerified: "true",
      };

      // ... rest of your submit logic remains same
      if (isEditing && existing && imageUri.startsWith("http")) {
        await updateProduct(existing._id, payload);
      } else {
        const formData = new FormData();

        if (imageUri) {
          formData.append("image", {
            uri: imageUri,
            name: "vehicle.jpg",
            type: "image/jpeg",
          } as any);
        }

        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        if (isEditing && existing) {
          await updateProduct(existing._id, formData);
        } else {
          if (!imageUri) {
            Alert.alert(
              "Missing photo",
              "Please upload a vehicle photo before publishing.",
            );
            return;
          }
          await createProduct(formData);
        }
      }

      Alert.alert(
        isEditing ? "Updated" : "Published",
        isEditing
          ? "Your listing has been updated."
          : "Your listing is now live.",
      );
      router.back();
    } catch (error: any) {
      Alert.alert("Upload failed", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </View>
    );
  }

  if (!userLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F64FF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={18} color="#101828" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Listing" : "Create Listing"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {imageUri ? (
        <View style={styles.stepRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepText}>Photo uploaded</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>
          <Text style={styles.stepCount}>Ready</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>AI Analysis Image</Text>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={pickImage}
        activeOpacity={0.9}
      >
        <View style={styles.uploadIconCircle}>
          <Upload size={22} color="#2F64FF" />
        </View>
        <Text style={styles.uploadTitle}>
          {imageUri ? "Change AI Analysis Image" : "Upload AI Analysis Image"}
        </Text>
        <Text style={styles.uploadSubtitle}>
          Generate overview, summary, and mileage from this image
        </Text>
      </TouchableOpacity>

      {imageUri ? (
        <View style={styles.previewWrap}>
          <Text style={styles.previewLabel}>AI Analysis Image preview</Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Listing Details</Text>
      <Text style={styles.sectionHint}>
        Only image, title, price, vehicle type, and year are required. Brand,
        model, and the rest are optional.
      </Text>
      <Field
        label="Listing Title *"
        value={title}
        onChangeText={setTitle}
        placeholder="2021 BMW M4 Competition"
      />
      <Field
        label="Price (₹)"
        value={price}
        onChangeText={setPrice}
        placeholder="72,000"
        keyboardType="numeric"
      />

      <View style={styles.twoCol}>
        <View style={styles.halfField}>
          <PickerField
            label="Vehicle Type *"
            value={vehicleType}
            onValueChange={setVehicleType}
            options={vehicleTypeOptions}
          />
        </View>
        <View style={styles.halfField}>
          <Field
            label="Year *"
            value={year}
            onChangeText={setYear}
            placeholder="2021"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.halfField}>
          <PickerField
            label="Brand (Optional)"
            value={brand}
            onValueChange={(value) => {
              setBrand(value);
              if (value !== "Other") {
                setCustomBrand("");
              }
              // Reset model when brand changes
              const newModelOptions = getModelsForBrand(vehicleType, value);
              if (
                !newModelOptions.some(
                  (option) => option.value === model && option.value !== "",
                )
              ) {
                setModel("");
                setCustomModel("");
              }
            }}
            options={getBrandsForVehicleType(vehicleType)}
          />
          {brand === "Other" ? (
            <Field
              label="Custom Brand"
              value={customBrand}
              onChangeText={setCustomBrand}
              placeholder="Enter brand name"
            />
          ) : null}
        </View>
        <View style={styles.halfField}>
          <PickerField
            label="Model (Optional)"
            value={model}
            onValueChange={(value) => {
              setModel(value);
              if (value !== "Other") {
                setCustomModel("");
              }
            }}
            options={getModelsForBrand(vehicleType, brand)}
          />
          {model === "Other" ? (
            <Field
              label="Custom Model"
              value={customModel}
              onChangeText={setCustomModel}
              placeholder="Enter model name"
            />
          ) : null}
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.halfField}>
          <Field
            label="Mileage"
            value={mileage}
            onChangeText={setMileage}
            placeholder="18,400 mi"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <Field
            label="Fuel Type"
            value={fuelType}
            onChangeText={setFuelType}
            placeholder="Petrol"
          />
        </View>
      </View>
      <View style={styles.twoCol}>
        <View style={styles.halfField}>
          <Field
            label="Transmission"
            value={transmission}
            onChangeText={setTransmission}
            placeholder="Automatic"
          />
        </View>
        <View style={styles.halfField}>
          <Field
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="400053"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* All location pickers, condition, description, creator card, publish button - 100% unchanged */}
      <View style={styles.twoCol}>
        <View style={styles.halfField}>
          <PickerField
            label="State"
            value={selectedStateValue}
            onValueChange={(value) => {
              setStateName(value);
              setDistrict("");
              setTaluk("");
              setVillage("");
            }}
            options={statePickerOptions}
          />
        </View>
        <View style={styles.halfField}>
          <PickerField
            label="District"
            value={selectedDistrictValue}
            onValueChange={(value) => {
              setDistrict(value);
              setTaluk("");
              setVillage("");
            }}
            options={districtPickerOptions}
          />
        </View>
      </View>
      <View style={styles.singleField}>
        <PickerField
          label={locationLoading ? "Taluk / Area (Loading...)" : "Taluk / Area"}
          value={selectedTalukValue}
          onValueChange={(value) => {
            setTaluk(value);
            setVillage("");
          }}
          options={talukPickerOptions}
        />
      </View>
      <View style={styles.singleField}>
        <PickerField
          label={selectedTalukValue ? "Village" : "Select taluk first"}
          value={selectedVillageValue}
          onValueChange={(value) => {
            setVillage(value);
          }}
          options={villagePickerOptions}
        />
      </View>
      <View style={styles.singleField}>
        <Field
          label="Location Preview"
          value={composedLocation || "Location will fill automatically"}
          onChangeText={() => {}}
          placeholder=""
          editable={false}
        />
      </View>
      <View style={styles.singleField}>
        <PickerField
          label="Condition"
          value={condition}
          onValueChange={setCondition}
          options={conditionOptions}
        />
      </View>
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Write a clear description"
        multiline
      />

      <Text style={styles.sectionTitle}>Creator</Text>
      <View style={styles.creatorCard}>
        <View style={styles.creatorRow}>
          {sellerAvatar ? (
            <Image
              source={{ uri: sellerAvatar }}
              style={styles.creatorAvatar}
            />
          ) : (
            <View style={styles.creatorAvatarFallback}>
              <User size={18} color="#2F64FF" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.creatorName}>{sellerName}</Text>
            <Text style={styles.creatorMeta}>
              {sellerEmail || "Email not available"}
            </Text>
          </View>
        </View>
        <Text style={styles.creatorHint}>
          This post will be linked to your signed-in account.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.publishButton}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.publishText}>
              {isEditing ? "Update Listing" : "Publish Listing"}
            </Text>
            <ChevronRight size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        editable={editable}
        style={[styles.fieldInput, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function PickerField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value || option.label}
              label={option.label}
              value={option.value}
              color="#101828"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = {
  screen: { flex: 1, backgroundColor: "#fff" as const },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 120 },
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
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
  stepRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginTop: 16,
    marginBottom: 18,
  },
  stepText: { color: "#2F64FF", fontWeight: "800" as const, marginBottom: 8 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "#E4E7EC" },
  progressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2F64FF",
  },
  stepCount: { color: "#667085", fontWeight: "700" as const, marginTop: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#101828",
    marginBottom: 12,
    marginTop: 6,
  },
  sectionHint: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C7D7FE",
    backgroundColor: "#F8FAFF",
    borderRadius: 20,
    height: 160,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
  },
  uploadIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAF1FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  uploadTitle: { fontWeight: "800" as const, color: "#2F64FF", fontSize: 15 },
  uploadSubtitle: { marginTop: 4, color: "#667085", fontSize: 12 },
  previewWrap: {
    marginBottom: 16,
  },
  previewLabel: {
    marginBottom: 8,
    color: "#101828",
    fontWeight: "700" as const,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#EEF2F6",
  },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: {
    marginBottom: 8,
    color: "#101828",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  fieldInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: "#101828",
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: "top" as const,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden" as const,
    minHeight: 48,
    justifyContent: "center" as const,
  },
  picker: {
    height: 48,
    color: "#101828",
  },
  twoCol: {
    flexDirection: "row" as const,
    gap: 10,
  },
  halfField: { flex: 1 },
  singleField: { width: "100%" },
  creatorCard: {
    backgroundColor: "#FBFCFE",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    padding: 14,
    marginBottom: 14,
  },
  creatorRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2F6",
  },
  creatorAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF4FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  creatorName: { color: "#101828", fontSize: 15, fontWeight: "900" as const },
  creatorMeta: { marginTop: 3, color: "#667085", fontSize: 12 },
  creatorHint: {
    marginTop: 10,
    color: "#667085",
    fontSize: 12,
    lineHeight: 18,
  },
  publishButton: {
    marginTop: 18,
    backgroundColor: "#2F64FF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: 8,
  },
  publishText: { color: "#fff", fontSize: 16, fontWeight: "800" as const },
};
