import { create } from "zustand";
import { propertyService } from "../services/propertyService";
import { imageService } from "../services/imageService";
import { notificationService } from "../services/notificationService";

export const useSellerStore = create((set, get) => ({
  properties: [],
  images: {},
  notifications: [],
  loading: false,
  error: null,

  loadSellerData: async (email) => {
    set({ loading: true, error: null });
    try {
      const props = await propertyService.getBySeller(email);

      const imageMap = {};
      for (const p of props) {
        try {
          imageMap[p.Id] = await imageService.getByProperty(p.Id);
        } catch {
          imageMap[p.Id] = [];
        }
      }

      set({ properties: props, images: imageMap, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  loadNotifications: async (email) => {
    try {
      const notifications = await notificationService.getBySeller(email);
      set({ notifications });
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  },

  addProperty: async (property, imageBase64) => {
    set({ loading: true, error: null });
    try {
      const created = await propertyService.add(property);
      if (imageBase64) {
        await imageService.upload(created.Id, imageBase64);
      }
      await get().loadSellerData(property.SellerEmail);
      set({ loading: false });
      return created;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProperty: async (id, property, email) => {
    set({ loading: true, error: null });
    try {
      await propertyService.update(id, property);
      await get().loadSellerData(email);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProperty: async (id, email) => {
    set({ loading: true, error: null });
    try {
      await propertyService.delete(id);
      await get().loadSellerData(email);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
