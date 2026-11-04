import api from "./api";
import type { ApiResponse, UserResponse } from "../types/api";

const userService = {
    getProfile: () =>
        api.get<ApiResponse<UserResponse>>("/api/users/me"),

    updateProfile: (data: {
        firstName: string;
        lastName: string;
    }) =>
        api.put<ApiResponse<UserResponse>>("/api/users/me", data),
};

export default userService;