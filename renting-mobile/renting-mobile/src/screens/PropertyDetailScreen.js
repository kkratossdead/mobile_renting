import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../auth/firebase";
import { useRentalStore } from "../store/rentalStore";
import { usePropertyStore } from "../store/propertyStore";
import { imageService } from "../services/imageService";
import { theme } from "../styles/theme";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const { rentProperty, addReview, loading } = useRentalStore();
  const { loadPropertyReviews, reviews, getAverageRating } = usePropertyStore();
  const scrollViewRef = useRef(null);

  const [images, setImages] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState("book");

  const propertyReviews = reviews[property.Id] || [];
  const avgRating = getAverageRating(property.Id);

  useEffect(() => {
    loadImages();
    loadPropertyReviews(property.Id);
  }, []);

  const loadImages = async () => {
    try {
      const imgs = await imageService.getByProperty(property.Id);
      setImages(imgs);
    } catch (err) {
      console.error("Error loading images:", err);
    }
  };

  const formatDateInput = (text, setter) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length >= 6) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    }
    
    setter(formatted);
  };

  const handleRent = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please enter start and end dates");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert("Error", "Please enter valid dates (YYYY-MM-DD)");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Error", "Invalid date format");
      return;
    }

    if (end <= start) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerNight = property.PricePerNight || property.pricePerNight || 0;
    const totalPrice = nights * pricePerNight;

    try {
      await rentProperty({
        propertyId: property.Id,
        renterEmail: auth.currentUser?.email,
        sellerEmail: property.SellerEmail || property.sellerEmail,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        numberOfPeople: 1,
        totalPrice: totalPrice,
      });
      Alert.alert("Success", `Property booked for ${nights} nights! Total: $${totalPrice.toFixed(2)}`);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleReview = async () => {
    if (!reviewText) {
      Alert.alert("Error", "Please enter a review");
      return;
    }

    try {
      await addReview({
        PropertyId: property.Id,
        RenterEmail: auth.currentUser?.email,
        Rating: rating,
        Text: reviewText,
      });
      Alert.alert("Success", "Review submitted!");
      setReviewText("");
      loadPropertyReviews(property.Id);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const mainImage = images[0]?.imageBase64 || images[0]?.ImageBase64;
  const imageSource = mainImage
    ? {
        uri: mainImage.startsWith("data:")
          ? mainImage
          : `data:image/jpeg;base64,${mainImage}`,
      }
    : null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.heroImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>No Image</Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>
                {property.PropertyType || property.propertyType}
              </Text>
            </View>

            <Text style={styles.title}>
              {property.Description || property.description}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ${property.PricePerNight || property.pricePerNight}
              </Text>
              <Text style={styles.perNight}> / night</Text>
            </View>

            {avgRating > 0 && (
              <View style={styles.ratingRow}>
                <View style={styles.ratingDots}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.ratingDot,
                        i <= Math.round(parseFloat(avgRating)) && styles.ratingDotFilled,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  {avgRating} ({propertyReviews.length} reviews)
                </Text>
              </View>
            )}
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "book" && styles.tabActive]}
              onPress={() => setActiveTab("book")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "book" && styles.tabTextActive,
                ]}
              >
                Book Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" && styles.tabTextActive,
                ]}
              >
                Reviews ({propertyReviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Tab */}
          {activeTab === "book" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Dates</Text>
              <Text style={styles.dateHint}>Format: YYYY-MM-DD (e.g., 2026-01-15)</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-01-15"
                    placeholderTextColor={theme.colors.muted}
                    value={startDate}
                    onChangeText={(text) => formatDateInput(text, setStartDate)}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="next"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-01-20"
                    placeholderTextColor={theme.colors.muted}
                    value={endDate}
                    onChangeText={(text) => formatDateInput(text, setEndDate)}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="done"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }}
                  />
                </View>
              </View>

              {startDate && endDate && startDate.length === 10 && endDate.length === 10 && (
                <View style={styles.pricePreview}>
                  <Text style={styles.pricePreviewText}>
                    {(() => {
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        const price = property.PricePerNight || property.pricePerNight || 0;
                        return `${nights} night${nights > 1 ? 's' : ''} × $${price} = $${(nights * price).toFixed(2)}`;
                      }
                      return '';
                    })()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.bookButton, loading && styles.bookButtonDisabled]}
                onPress={() => { Keyboard.dismiss(); handleRent(); }}
                disabled={loading}
              >
                <Text style={styles.bookButtonText}>
                  {loading ? "Booking..." : "Book Now"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <View style={styles.section}>
              {/* Add Review */}
              <View style={styles.addReviewCard}>
                <Text style={styles.sectionTitle}>Write a Review</Text>

                <View style={styles.starSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <View
                        style={[
                          styles.ratingCircle,
                          star <= rating && styles.ratingCircleFilled,
                        ]}
                      >
                        <Text style={[
                          styles.ratingCircleText,
                          star <= rating && styles.ratingCircleTextFilled,
                        ]}>{star}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Share your experience..."
                  placeholderTextColor={theme.colors.muted}
                  multiline
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                />

                <TouchableOpacity
                  style={styles.submitReviewButton}
                  onPress={handleReview}
                >
                  <Text style={styles.submitReviewText}>Submit Review</Text>
                </TouchableOpacity>
              </View>

              {/* Reviews List */}
              {propertyReviews.length === 0 ? (
                <View style={styles.noReviews}>
                  <View style={styles.noReviewsIconContainer}>
                    <Text style={styles.noReviewsIconText}>0</Text>
                  </View>
                  <Text style={styles.noReviewsText}>No reviews yet</Text>
                </View>
              ) : (
                propertyReviews.map((review, index) => {
                  const email = review.RenterEmail || review.renterEmail || "User";
                  const reviewRating = review.Rating || review.rating || 0;
                  const text = review.Text || review.text || review.Comment || review.comment || "";
                  return (
                    <View key={index} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.avatarText}>
                            {email[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.reviewMeta}>
                          <Text style={styles.reviewAuthor}>
                            {email}
                          </Text>
                          <Text style={styles.reviewRatingText}>
                            {reviewRating}/5
                          </Text>
                        </View>
                      </View>
                      {text ? (
                        <Text style={styles.reviewComment}>{text}</Text>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}
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
  imageContainer: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.5,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    marginTop: -40,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  typeTag: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.accent,
  },
  perNight: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  ratingDots: {
    flexDirection: "row",
    gap: 4,
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  ratingDotFilled: {
    backgroundColor: theme.colors.accent,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  tabTextActive: {
    color: "#fff",
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  dateHint: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.muted,
    marginBottom: 8,
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
  pricePreview: {
    backgroundColor: theme.colors.accent + '20',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  pricePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  bookButtonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  addReviewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  starSelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingCircleFilled: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  ratingCircleText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.muted,
  },
  ratingCircleTextFilled: {
    color: "#fff",
  },
  submitReviewButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  submitReviewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noReviewsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  noReviewsIconText: {
    fontSize: 24,
    fontWeight: "300",
    color: theme.colors.muted,
  },
  noReviewsText: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  reviewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  reviewRatingText: {
    fontSize: 12,
    marginTop: 2,
    color: theme.colors.accent,
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});
