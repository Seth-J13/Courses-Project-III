import apiClient from "./services.js";

const userServices = {
  getUsers() {
    return apiClient.get("users");
  },

  getUser(universityId) {
    return apiClient.get(`users/${universityId}`);
  },

  updateUser(universityId, payload) {
    return apiClient.put(`users/${universityId}`, payload);
  },
};

export default userServices;
