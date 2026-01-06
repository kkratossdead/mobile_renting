import apiClient from "./apiClient";

export const propertyService = {
  getAll: async () => {
    return apiClient.get("/property");
  },

  getBySeller: async (email) => {
    return apiClient.get(`/property/seller/${encodeURIComponent(email)}`);
  },

  add: async (property) => {
    return apiClient.post("/property/add", property);
  },

  update: async (id, property) => {
    return apiClient.put(`/property/${id}`, property);
  },

  delete: async (id) => {
    return apiClient.delete(`/property/${id}`);
  },
};

export default propertyService;
