import { create } from "zustand";
import { propertyService } from "../services/propertyService";
import { imageService } from "../services/imageService";
import { reviewService } from "../services/reviewService";

export const usePropertyStore = create((set, get) => ({
  properties: [],
  images: {},
  reviews: {},
  loading: false,
  error: null,

  loadAllProperties: async () => {
    set({ loading: true, error: null });
    try {
      const props = await propertyService.getAll();
      
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

  loadPropertyReviews: async (propertyId) => {
    try {
      const reviews = await reviewService.getByProperty(propertyId);
      set((state) => ({
        reviews: { ...state.reviews, [propertyId]: reviews },
      }));
      return reviews;
    } catch (error) {
      console.error("Error loading reviews:", error);
      return [];
    }
  },

  getAverageRating: (propertyId) => {
    const reviews = get().reviews[propertyId] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.Rating, 0);
    return (sum / reviews.length).toFixed(1);
  },

  clearError: () => set({ error: null }),
}));

export default usePropertyStore;
