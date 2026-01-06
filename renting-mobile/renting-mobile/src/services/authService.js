import apiClient from "./apiClient";

export const authService = {
  registerInBackend: async (email, password, role = "renter") => {
    return apiClient.post("/auth/register", {
      email,
      password,
      role,
    });
  },

  loginInBackend: async (email, password) => {
    return apiClient.post("/auth/login", {
      email,
      password,
    });
  },
};

export default authService;
