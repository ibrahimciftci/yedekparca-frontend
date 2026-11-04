
import api from "./api";
import type {
    ApiResponse,
    SellerResponse,
    SellerReviewRequest,
} from "../types/api";

const adminSellerService = {
    getPendingApplications: async () => {
        const response = await api.get<ApiResponse<SellerResponse[]>>(
            "/api/admin/sellers/pending"
        );
        return response.data;
    },

    approveApplication: async (id: number) => {
        const response = await api.put<ApiResponse<SellerResponse>>(
            `/api/admin/sellers/${id}/approve`
        );
        return response.data;
    },

    rejectApplication: async (
        id: number,
        data: SellerReviewRequest
    ) => {
        const response = await api.put<ApiResponse<SellerResponse>>(
            `/api/admin/sellers/${id}/reject`,
            data
        );
        return response.data;
    },
};

export default adminSellerService;
