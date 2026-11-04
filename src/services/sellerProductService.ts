import api from "./api";
import type { ApiResponse, ProductModerationStatus, ProductPageResponse, ProductRequest, ProductResponse } from "../types/api";

const sellerProductService = {
    getProducts: async (params: { search?: string; status?: ProductModerationStatus; page?: number; size?: number }) => {
        const response = await api.get<ApiResponse<ProductPageResponse<ProductResponse>>>("/api/seller/products", { params });
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await api.get<ApiResponse<ProductResponse>>(`/api/seller/products/${id}`);
        return response.data;
    },
    createProduct: async (data: ProductRequest) => {
        const response = await api.post<ApiResponse<ProductResponse>>("/api/seller/products", data);
        return response.data;
    },
    updateProduct: async (id: number, data: ProductRequest) => {
        const response = await api.put<ApiResponse<ProductResponse>>(`/api/seller/products/${id}`, data);
        return response.data;
    },
};

export default sellerProductService;
