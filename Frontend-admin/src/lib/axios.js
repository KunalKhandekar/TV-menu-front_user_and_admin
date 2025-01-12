import axios from "axios";

const backendURL = import.meta.env.VITE_BACKENDURL;

if (!backendURL) {
  throw new Error("VITE_BACKENDURL is not defined in your environment variables.");
}

export const axiosInstance = axios.create({
  baseURL: `${backendURL}/api`,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;

