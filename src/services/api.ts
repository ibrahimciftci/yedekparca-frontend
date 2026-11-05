
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Her istekte varsa JWT token'ını otomatik gönderir.
api.interceptors.request.use(
    (config) => {
        // The shared JSON default must not leak into multipart uploads. Let the
        // browser/Axios set Content-Type with the generated multipart boundary.
        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
            config.headers.delete("Content-Type");
        }

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
