import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products`;

const CATEGORY_OPTIONS = [
  "car",
  "bike",
  "scooter",
  "electric-car",
  "electric-bike",
  "electric-scooter",
];

const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];
const DRIVE_OPTIONS = ["2WD", "4WD", "AWD"];

const KEY_SPECS = [
  "4x4 Standard",
  "Turbo Engine",
  "High Ground Clearance",
  "ADAS",
  "Premium Styling",
];
const TOP_FEATURES = [
  "Touchscreen",
  "Cruise Control",
  "Sunroof",
  "Ventilated Seats",
  "360° Camera",
];
const STAND_OUT = [
  "Off-road Beast",
  "Convertible",
  "Sporty Look",
  "Luxury Interior",
  "Hybrid Tech",
];

export default function CreateProduct() {
  const [imageUri, setImageUri] = useState<string>("");

  const [form, setForm] = useState({
    text: "",
    price: "",
    category: "car",
    transmission: "Manual",
    engine: "",
    power: "",
    torque: "",
    driveType: "2WD",

    keySpecifications: [] as string[],
    topFeatures: [] as string[],
    standOutFeatures: [] as string[],

    keyTxt: "",
    topTxt: "",
    standTxt: "",
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addItem = (list: string[], value: string): string[] => {
    if (!value.trim() || list.includes(value.trim())) return list;
    return [...list, value.trim()];
  };

  const removeItem = (list: string[], value: string): string[] => {
    return list.filter((item) => item !== value);
  };

  const submitProduct = async () => {
    if (!imageUri || !form.text.trim() || !form.price) {
      Alert.alert("Missing Fields", "Please add image, name, and price");
      return;
    }

    const payload = {
      image: imageUri,
      text: form.text.trim(),
      price: Number(form.price),
      category: form.category,
      specs: {
        engine: form.engine,
        power: form.power && `${form.power} hp`,
        torque: form.torque && `${form.torque} Nm`,
        transmission: form.transmission,
        driveType: form.driveType,
      },
      keySpecifications: form.keySpecifications,
      topFeatures: form.topFeatures,
      standOutFeatures: form.standOutFeatures,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Upload failed");

      Alert.alert("Success", "Vehicle added successfully!", [{ text: "OK" }]);

      // Reset form
      setImageUri("");
      setForm({
        text: "",
        price: "",
        category: "car",
        transmission: "Manual",
        engine: "",
        power: "",
        torque: "",
        driveType: "2WD",
        keySpecifications: [],
        topFeatures: [],
        standOutFeatures: [],
        keyTxt: "",
        topTxt: "",
        standTxt: "",
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const renderChipSection = (
    title: string,
    suggestions: string[],
    list: string[],
    inputKey: "keyTxt" | "topTxt" | "standTxt",
    listKey: "keySpecifications" | "topFeatures" | "standOutFeatures"
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {/* Suggestion Chips */}
      <View style={styles.chipContainer}>
        {suggestions.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, list.includes(item) && styles.chipSelected]}
            onPress={() =>
              setForm({
                ...form,
                [listKey]: list.includes(item)
                  ? removeItem(list, item)
                  : addItem(list, item),
              })
            }
          >
            <Text
              style={[
                styles.chipText,
                list.includes(item) && styles.chipTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Add */}
      <View style={styles.addCustomRow}>
        <TextInput
          style={styles.customInput}
          placeholder="Add custom..."
          value={form[inputKey]}
          onChangeText={(v) => setForm({ ...form, [inputKey]: v })}
        />
        <TouchableOpacity
          style={styles.addCustomBtn}
          onPress={() => {
            setForm({
              ...form,
              [listKey]: addItem(form[listKey], form[inputKey]),
              [inputKey]: "",
            });
          }}
        >
          <Text style={styles.addCustomBtnText}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Items with Remove */}
      {list.length > 0 && (
        <View style={styles.selectedChips}>
          {list.map((item) => (
            <View key={item} style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>{item}</Text>
              <TouchableOpacity
                onPress={() =>
                  setForm({ ...form, [listKey]: removeItem(list, item) })
                }
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Add New Vehicle</Text>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#999" />
            <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {imageUri ? (
        <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
          <Text style={styles.changeImageText}>Change Photo</Text>
        </TouchableOpacity>
      ) : null}

      {/* Basic Info */}
      <TextInput
        style={styles.input}
        placeholder="Vehicle Name (e.g. Toyota Fortuner)"
        value={form.text}
        onChangeText={(v) => setForm({ ...form, text: v })}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (₹)"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(v) =>
          setForm({ ...form, price: v.replace(/[^0-9]/g, "") })
        }
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.category}
          onValueChange={(v) => setForm({ ...form, category: v })}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <Picker.Item
              key={opt}
              label={opt.replace("-", " ").toUpperCase()}
              value={opt}
            />
          ))}
        </Picker>
      </View>

      {/* Specs */}
      <TextInput
        style={styles.input}
        placeholder="Engine (e.g. 2.8L Diesel)"
        value={form.engine}
        onChangeText={(v) => setForm({ ...form, engine: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Power (e.g. 204)"
        value={form.power}
        onChangeText={(v) => setForm({ ...form, power: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Torque (e.g. 500)"
        value={form.torque}
        onChangeText={(v) => setForm({ ...form, torque: v })}
      />

      {/* Transmission */}
      <Text style={styles.label}>Transmission</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.transmission}
          onValueChange={(v) => setForm({ ...form, transmission: v })}
        >
          {TRANSMISSION_OPTIONS.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}
        </Picker>
      </View>

      {/* Drive Type */}
      <Text style={styles.label}>Drive Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.driveType}
          onValueChange={(v) => setForm({ ...form, driveType: v })}
        >
          {DRIVE_OPTIONS.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}
        </Picker>
      </View>

      {/* Feature Sections */}
      {renderChipSection(
        "Key Specifications",
        KEY_SPECS,
        form.keySpecifications,
        "keyTxt",
        "keySpecifications"
      )}
      {renderChipSection(
        "Top Features",
        TOP_FEATURES,
        form.topFeatures,
        "topTxt",
        "topFeatures"
      )}
      {renderChipSection(
        "Stand Out Points",
        STAND_OUT,
        form.standOutFeatures,
        "standTxt",
        "standOutFeatures"
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={submitProduct}>
        <Text style={styles.submitBtnText}>ADD VEHICLE</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePicker: {
    height: 220,
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  changeImageBtn: {
    alignSelf: "center",
    marginBottom: 16,
  },
  changeImageText: {
    color: "#f97316",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    overflow: "hidden",
  },
  section: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipSelected: {
    backgroundColor: "#ff6b35",
    borderColor: "#ff6b35",
  },
  chipText: {
    color: "#475569",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  addCustomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },
  addCustomBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addCustomBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectedChipText: {
    color: "#92400e",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#f97316",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
