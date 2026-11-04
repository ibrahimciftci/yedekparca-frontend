import api from "./api";
import type { ApiResponse, ProductModerationStatus, ProductPageResponse, ProductResponse } from "../types/api";

export interface AdminProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    sellerId?: number;
    moderationStatus?: ProductModerationStatus;
    active?: boolean;
    page?: number;
    size?: number;
}

const adminProductService = {
    getProducts: async (params: AdminProductFilters) => {
        const response = await api.get<ApiResponse<ProductPageResponse<ProductResponse>>>("/api/admin/products", { params });
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await api.get<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`);
        return response.data;
    },
    approveProduct: async (id: number) => {
        const response = await api.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}/approve`);
        return response.data;
    },
    rejectProduct: async (id: number, rejectionReason: string) => {
        const response = await api.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}/reject`, { rejectionReason });
        return response.data;
    },
    setActive: async (id: number, active: boolean) => {
        const response = await api.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}/active`, { active });
        return response.data;
    },
};

export default adminProductService;
