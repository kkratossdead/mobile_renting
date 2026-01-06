import apiClient from "./apiClient";

export const rentalService = {
  rent: async (rental) => {
    return apiClient.post("/rental/rent", rental);
  },

  getByRenter: async (email) => {
    return apiClient.get(`/rental/renter/${encodeURIComponent(email)}`);
  },
};

export default rentalService;
