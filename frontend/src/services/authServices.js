import apiClient from "./services.js";
import Utils from "../config/utils.js";
import router from "../router.js";

const authServices = {
  registerUser(payload) {
    return apiClient.post("Register", payload);
  },

  loginUser({ email, password }) {
    return apiClient.post("login", {}, {
      headers: {
        Authorization: `Basic ${btoa(`${email}:${password}`)}`,
      },
    });
  },

  async logoutUser() {
    try {
      await apiClient.post("Logout");
    } finally {
      Utils.removeItem("user");
      window.dispatchEvent(new CustomEvent("user-logged-out"));
      await router.push({ name: "Login" });
    }
  },
};

export default authServices;
