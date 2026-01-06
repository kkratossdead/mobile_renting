import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../styles/theme";

export default function AddPropertyModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState({
    description: "",
    propertyType: "",
    pricePerNight: "",
    maxPerson: "2",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
      return;
    }
    setLoading(true);
    await onSave(form, image?.base64);
    setForm({ description: "", propertyType: "", pricePerNight: "", maxPerson: "2" });
    setImage(null);
    setLoading(false);
  };

  const handleClose = () => {
    setForm({ description: "", propertyType: "", pricePerNight: "", maxPerson: "2" });
    setImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add New Property</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {image ? (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePickerContent}>
                    <Text style={styles.imageText}>Tap to add photo</Text>
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
                        form.propertyType === type && styles.typeChipActive,
                      ]}
                      onPress={() => setForm({ ...form, propertyType: type })}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          form.propertyType === type && styles.typeChipTextActive,
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

              {/* Max Persons */}
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
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!form.description || !form.propertyType || !form.pricePerNight) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={
                    !form.description || !form.propertyType || !form.pricePerNight || loading
                  }
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Adding..." : "Add Property"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  imagePicker: {
    height: 180,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 20,
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.background,
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
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
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
