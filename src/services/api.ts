
import axios from "axios";
import { isAxiosError } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export function resolveApiAssetUrl(source?: string | null): string | undefined {
    if (!source) return undefined;
    if (/^(?:https?:)?\/\//i.test(source) || source.startsWith("data:") || source.startsWith("blob:")) return source;
    const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    return new URL(source, base.endsWith("/") ? base : `${base}/`).toString();
}

const isPublicGet = (method: string | undefined, rawUrl: string | undefined) => {
    if ((method || "get").toLowerCase() !== "get") return false;
    const path = String(rawUrl || "").split("?")[0].replace(/^https?:\/\/[^/]+/i, "");
    return /^\/api\/(?:catalog\/products(?:\/[^/]+)?|marketplace\/catalog|catalog\/(?:categories|brands)|vehicles\/(?:types|brands(?:\/[^/]+\/models)?)|locations(?:\/.*)?|sellers(?:\/\d+\/(?:profile|offers))?|dev-demo\/images\/(?:parts\/)?[^/]+)$/.test(path);
};

// Her istekte varsa JWT token'ını otomatik gönderir.
api.interceptors.request.use(
    (config) => {
        // The shared JSON default must not leak into multipart uploads. Let the
        // browser/Axios set Content-Type with the generated multipart boundary.
        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
            config.headers.delete("Content-Type");
        }

        const token = localStorage.getItem("token");

        if (token && !isPublicGet(config.method, config.url)) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            config.headers.delete("Authorization");
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let sessionEnding = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const config = error.config;
        const url = String(config?.url ?? "").split("?")[0];
        const isLoginRequest = /(?:^|\/)api\/auth\/(?:login|register)\/?$/.test(url);
        const hadSession = Boolean(config?.headers?.Authorization) && Boolean(localStorage.getItem("token"));
        const authError = String(error.response?.data?.message ?? "").toLowerCase();
        const expiredToken = authError.includes("expired") || authError.includes("süresi dol") || authError.includes("geçersiz oturum");

        if (isAxiosError(error) && error.response?.status === 401 && hadSession && !isLoginRequest && expiredToken && !sessionEnding) {
            sessionEnding = true;
            localStorage.removeItem("token");
            import("./favoriteStore").then(({ resetFavorites }) => resetFavorites());
            window.dispatchEvent(new Event("parcahan-auth-changed"));
            window.dispatchEvent(new CustomEvent("parcahan-session-expired", {
                detail: "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın."
            }));
            if (window.location.pathname !== "/login") {
                const redirect = `${window.location.pathname}${window.location.search}`;
                window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
