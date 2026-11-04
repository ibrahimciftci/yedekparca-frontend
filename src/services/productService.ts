import api from "./api";
import type { ApiResponse, ProductCondition, ProductPageResponse, PublicProductResponse } from "../types/api";

export interface ProductCatalogFilters {
    search?: string;
    category?: string;
    brand?: string;
    oemNumber?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: ProductCondition;
    vehicleBrand?: string;
    vehicleModel?: string;
    modelYear?: number;
    engineInfo?: string;
    page?: number;
    size?: number;
    sortBy?: "createdAt" | "price" | "name";
    direction?: "asc" | "desc";
}

const productService = {
    getProducts: async (params: ProductCatalogFilters) => {
        const response = await api.get<ApiResponse<ProductPageResponse<PublicProductResponse>>>("/api/products", { params });
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await api.get<ApiResponse<PublicProductResponse>>(`/api/products/${id}`);
        return response.data;
    },
};

export default productService;
