import { create } from "zustand";
import { rentalService } from "../services/rentalService";
import { reviewService } from "../services/reviewService";

export const useRentalStore = create((set, get) => ({
  rentals: [],
  loading: false,
  error: null,

  loadRentals: async (email) => {
    set({ loading: true, error: null });
    try {
      const rentals = await rentalService.getByRenter(email);
      set({ rentals, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  rentProperty: async (rental) => {
    set({ loading: true, error: null });
    try {
      await rentalService.rent(rental);
      await get().loadRentals(rental.renterEmail);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addReview: async (review) => {
    set({ loading: true, error: null });
    try {
      await reviewService.add(review);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRentalStore;
