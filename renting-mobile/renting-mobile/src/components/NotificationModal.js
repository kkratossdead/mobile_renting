import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Animated, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { theme } from "../styles/theme";

export default function NotificationModal({ visible, onClose, notifications }) {
  const renderNotification = ({ item, index }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50)}
      style={styles.notifCard}
    >
      <View style={styles.notifIconBox}>
        <Text style={styles.notifIconText}>N</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifText}>{item.Text || item.text}</Text>
        <Text style={styles.notifDate}>{item.Date || item.date}</Text>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInRight.duration(300)}
          exiting={SlideOutRight.duration(200)}
          style={styles.panel}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Notification List */}
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => item.Id || index.toString()}
            renderItem={renderNotification}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Text style={styles.emptyIconText}>0</Text>
                </View>
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyText}>
                  You'll see booking notifications here
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    width: "85%",
    maxWidth: 380,
    backgroundColor: theme.colors.card,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.muted,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notifIconText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
    lineHeight: 22,
  },
  notifDate: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.muted,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
  },
});
