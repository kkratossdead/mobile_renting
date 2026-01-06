import apiClient from "./apiClient";

export const reviewService = {
  getAll: async () => {
    return apiClient.get("/review");
  },

  getByProperty: async (propertyId) => {
    return apiClient.get(`/review/property/${propertyId}`);
  },

  add: async (review) => {
    return apiClient.post("/review/add", review);
  },
};

export default reviewService;
