import apiClient from "./apiClient";

export const notificationService = {
  getBySeller: async (email) => {
    return apiClient.get(`/notifications/seller/${encodeURIComponent(email)}`);
  },
};

export default notificationService;
