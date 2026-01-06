// Store pour gérer les notifications (seller)
import { create } from "zustand";
import { notificationService } from "../services/notificationService";

export const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,

  // Charger les notifications d'un vendeur
  loadNotifications: async (email) => {
    set({ loading: true, error: null });
    try {
      const notifications = await notificationService.getBySeller(email);
      set({ notifications, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useNotificationStore;
