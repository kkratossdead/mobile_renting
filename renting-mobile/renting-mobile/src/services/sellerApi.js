// src/services/sellerApi.js
const BASE_URL = "http://192.168.11.106:5062";

export const sellerApi = {
  getProperties: async (email) => {
    const res = await fetch(`${BASE_URL}/api/property/seller/${email}`);
    if (!res.ok) throw new Error("Failed to fetch properties");
    return res.json();
  },

  addProperty: async (data) => {
    const res = await fetch(`${BASE_URL}/api/property/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteProperty: async (id) => {
    await fetch(`${BASE_URL}/api/property/${id}`, { method: "DELETE" });
  },

  uploadImage: async (propertyId, base64) => {
    await fetch(`${BASE_URL}/api/image/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, imageBase64: base64 }),
    });
  },

  getImages: async (propertyId) => {
    const res = await fetch(`${BASE_URL}/api/image/property/${propertyId}`);
    return res.json();
  },
};
