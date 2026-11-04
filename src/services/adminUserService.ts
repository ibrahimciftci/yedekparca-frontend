import api from "./api";
import type { AdminUserPageResponse, AdminUserResponse, ApiResponse } from "../types/api";

const adminUserService = {
    getUsers: async (params: { search: string; role: string; page: number; size: number }) => {
        const response = await api.get<ApiResponse<AdminUserPageResponse>>("/api/admin/users", {
            params: {
                search: params.search || undefined,
                role: params.role || undefined,
                page: params.page,
                size: params.size,
            },
        });
        return response.data;
    },

    updateStatus: async (id: number, active: boolean) => {
        const response = await api.put<ApiResponse<AdminUserResponse>>(
            `/api/admin/users/${id}/status`,
            { active },
        );
        return response.data;
    },
};

export default adminUserService;
