import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { auth } from "../auth/firebase";
import { useSellerStore } from "../store/sellerStore";
import AddPropertyModal from "../components/AddPropertyModal";
import NotificationModal from "../components/NotificationModal";
import { theme } from "../styles/theme";

export default function SellerScreen({ navigation }) {
  const email = auth.currentUser?.email;
  const {
    properties,
    images,
    notifications,
    loading,
    loadSellerData,
    loadNotifications,
    addProperty,
    deleteProperty,
  } = useSellerStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (email) {
      loadSellerData(email);
      loadNotifications(email);
    }
  }, [email]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSellerData(email);
    await loadNotifications(email);
    setRefreshing(false);
  };

  const handleAddProperty = async (form, imageBase64) => {
    try {
      const propertyData = {
        description: form.description,
        propertyType: form.propertyType,
        pricePerNight: parseFloat(form.pricePerNight),
        maxPerson: parseInt(form.maxPerson) || 2,
        sellerEmail: email,
        rentalStatus: "Available",
      };
      console.log("Adding property with data:", JSON.stringify(propertyData, null, 2));
      await addProperty(propertyData, imageBase64);
      setModalVisible(false);
      Alert.alert("Success", "Property added successfully!");
    } catch (err) {
      console.error("Error adding property:", err);
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProperty(id, email),
        },
      ]
    );
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  const renderPropertyCard = ({ item }) => {
    const imgData = images[item.Id]?.[0];
    const imageBase64 = imgData?.imageBase64 || imgData?.ImageBase64;
    const imageSource = imageBase64
      ? { uri: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
      : null;

    return (
      <View style={styles.propertyCard}>
        {imageSource ? (
          <Image source={imageSource} style={styles.propertyImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>No Image</Text>
          </View>
        )}

        <View style={styles.propertyInfo}>
          <View style={styles.propertyType}>
            <Text style={styles.propertyTypeText}>
              {item.PropertyType || item.propertyType}
            </Text>
          </View>

          <Text style={styles.propertyTitle} numberOfLines={2}>
            {item.Description || item.description}
          </Text>

          <Text style={styles.propertyPrice}>
            ${item.PricePerNight || item.pricePerNight}
            <Text style={styles.perNight}> / night</Text>
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProperty", { property: item })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.Id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Your Dashboard</Text>
          <Text style={styles.title}>Seller Portal</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => setNotifVisible(true)}
          >
            <View style={styles.notifIconContainer}>
              <Text style={styles.notifIconText}>N</Text>
            </View>
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{properties.length}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={[styles.statNumber, styles.statNumberAccent]}>
            {notifications.length}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelAccent]}>
            Notifications
          </Text>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Properties</Text>
      </View>

      {/* Properties List */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.Id}
        renderItem={renderPropertyCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptyText}>Add your first property below</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Property Modal */}
      <AddPropertyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddProperty}
      />

      {/* Notifications Modal */}
      <NotificationModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        notifications={notifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.muted,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notifIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  notifIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b3b",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardAccent: {
    backgroundColor: theme.colors.accent,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statNumberAccent: {
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 4,
  },
  statLabelAccent: {
    color: "rgba(255,255,255,0.9)",
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  propertyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  propertyImage: {
    width: "100%",
    height: 160,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyType: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.backgroundDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  propertyTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.accent,
    marginBottom: 16,
  },
  perNight: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.muted,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    fontWeight: "600",
    color: "#dc2626",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
});
