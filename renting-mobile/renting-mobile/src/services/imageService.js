import apiClient from "./apiClient";

export const imageService = {
  upload: async (propertyId, imageBase64) => {
    return apiClient.post("/image/upload", {
      propertyId,
      imageBase64,
    });
  },

  getByProperty: async (propertyId) => {
    return apiClient.get(`/image/property/${propertyId}`);
  },
};

export default imageService;
