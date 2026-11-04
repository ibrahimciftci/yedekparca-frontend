
import api from "./api";
import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
} from "../types/api";

const authService = {
    register: async (data: RegisterRequest) => {
        const response = await api.post<ApiResponse<UserResponse>>(
            "/api/auth/register",
            data
        );
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/api/auth/login",
            data
        );
        return response.data;
    },
};

export default authService;
