import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../auth/firebase";
import { usePropertyStore } from "../store/propertyStore";
import { theme } from "../styles/theme";

export default function RenterHomeScreen({ navigation }) {
  const { properties, images, loading, loadAllProperties } = usePropertyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAllProperties();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllProperties();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  const filteredProperties = properties.filter((p) => {
    const desc = (p.Description || p.description || "").toLowerCase();
    const type = (p.PropertyType || p.propertyType || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return desc.includes(query) || type.includes(query);
  });

  const renderPropertyCard = ({ item }) => {
    const imgData = images[item.Id]?.[0];
    const imageBase64 = imgData?.imageBase64 || imgData?.ImageBase64;
    const imageSource = imageBase64
      ? { uri: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
      : null;

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => navigation.navigate("PropertyDetail", { property: item })}
        activeOpacity={0.9}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.propertyImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>No Image</Text>
          </View>
        )}
        
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <View style={styles.propertyType}>
              <Text style={styles.propertyTypeText}>
                {item.PropertyType || item.propertyType}
              </Text>
            </View>
          </View>
          
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {item.Description || item.description}
          </Text>
          
          <View style={styles.propertyFooter}>
            <Text style={styles.propertyPrice}>
              ${item.PricePerNight || item.pricePerNight}
              <Text style={styles.perNight}> / night</Text>
            </Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find your</Text>
          <Text style={styles.title}>Perfect Stay </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconBox}>
          <Text style={styles.searchIconText}>S</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{properties.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={[styles.statNumber, styles.statNumberAccent]}>
            {filteredProperties.length}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelAccent]}>
            Matching
          </Text>
        </View>
      </View>

      {/* Properties List */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.Id}
        renderItem={renderPropertyCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIconText}>?</Text>
            </View>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Try a different search" : "Check back later"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    fontSize: 16,
    color: theme.colors.muted,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4,
  },
  logoutBtn: {
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
  logoutIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    marginHorizontal: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
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
    backgroundColor: theme.colors.primary,
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
    color: "rgba(255,255,255,0.8)",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    height: 180,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: "500",
  },
  propertyInfo: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  propertyType: {
    backgroundColor: theme.colors.backgroundDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginBottom: 12,
    lineHeight: 24,
  },
  propertyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  perNight: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.muted,
  },
  viewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
    fontWeight: "300",
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
});
