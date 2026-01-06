import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { auth } from "../auth/firebase";

const { height } = Dimensions.get("window");

export default function ChoiceScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.replace("Login");
    }
  }, []);

  const renterOpacity = useSharedValue(0);
  const sellerOpacity = useSharedValue(0);
  const renterTranslate = useSharedValue(-50);
  const sellerTranslate = useSharedValue(50);

  useEffect(() => {
    renterOpacity.value = withTiming(1, { duration: 600 });
    sellerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    renterTranslate.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    sellerTranslate.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, []);

  const renterStyle = useAnimatedStyle(() => ({
    opacity: renterOpacity.value,
    transform: [{ translateY: renterTranslate.value }],
  }));

  const sellerStyle = useAnimatedStyle(() => ({
    opacity: sellerOpacity.value,
    transform: [{ translateY: sellerTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Renter Section - Top Half */}
      <Animated.View style={[styles.halfSection, renterStyle]}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => navigation.navigate("RenterHome")}
          activeOpacity={0.85}
        >
          <View style={[styles.section, styles.renterSection]}>
            <Text style={[styles.sectionText, styles.renterText]}>RENTER</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Seller Section - Bottom Half */}
      <Animated.View style={[styles.halfSection, sellerStyle]}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => navigation.navigate("SellerHome")}
          activeOpacity={0.85}
        >
          <View style={[styles.section, styles.sellerSection]}>
            <Text style={[styles.sectionText, styles.sellerText]}>SELLER</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  halfSection: {
    flex: 1,
  },
  touchable: {
    flex: 1,
  },
  section: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  renterSection: {
    backgroundColor: "#1a1a1a",
  },
  sellerSection: {
    backgroundColor: "#f5f5f5",
  },
  sectionText: {
    fontSize: 42,
    fontWeight: "300",
    letterSpacing: 12,
  },
  renterText: {
    color: "#ffffff",
  },
  sellerText: {
    color: "#1a1a1a",
  },
});
