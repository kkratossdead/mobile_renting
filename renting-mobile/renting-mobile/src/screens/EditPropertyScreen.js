import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useSellerStore } from "../store/sellerStore";
import { auth } from "../auth/firebase";
import { theme } from "../styles/theme";

export default function EditPropertyScreen({ route, navigation }) {
  const { property } = route.params;
  const { updateProperty, loading } = useSellerStore();

  const [form, setForm] = useState({
    description: property.description || property.Description || "",
    propertyType: property.propertyType || property.PropertyType || "",
    pricePerNight: String(property.pricePerNight || property.PricePerNight || ""),
    maxPerson: String(property.maxPerson || property.MaxPerson || "2"),
  });
  const [image, setImage] = useState(null);

  const propertyTypes = ["Apartment", "House", "Villa", "Studio", "Condo"];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!form.description || !form.propertyType || !form.pricePerNight) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const updatedProperty = {
        Id: property.Id,
        description: form.description,
        propertyType: form.propertyType,
        pricePerNight: parseFloat(form.pricePerNight),
        maxPerson: parseInt(form.maxPerson) || 2,
        sellerEmail: property.sellerEmail || property.SellerEmail,
        rentalStatus: property.rentalStatus || property.RentalStatus || "Available",
      };

      await updateProperty(property.Id, updatedProperty, auth.currentUser?.email);
      Alert.alert("Success", "Property updated successfully!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Property</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image Picker */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerContent}>
              <Text style={styles.imageText}>Tap to change photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your property..."
            placeholderTextColor={theme.colors.muted}
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Property Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Property Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
          >
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  form.propertyType.toLowerCase() === type.toLowerCase() && styles.typeChipActive,
                ]}
                onPress={() => setForm({ ...form, propertyType: type })}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    form.propertyType.toLowerCase() === type.toLowerCase() && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price per Night ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={theme.colors.muted}
            value={form.pricePerNight}
            onChangeText={(v) => setForm({ ...form, pricePerNight: v })}
            keyboardType="numeric"
          />
        </View>

        {/* Max Guests */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Maximum Guests</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            placeholderTextColor={theme.colors.muted}
            value={form.maxPerson}
            onChangeText={(v) => setForm({ ...form, maxPerson: v })}
            keyboardType="numeric"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  placeholder: {
    width: 44,
  },
  imagePicker: {
    height: 180,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 24,
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imageText: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeScroll: {
    marginLeft: -4,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  typeChipTextActive: {
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
