
import api from "./api";
import type {
    ApiResponse,
    SellerApplicationRequest,
    SellerResponse,
} from "../types/api";

const sellerService = {
    apply: async (data: SellerApplicationRequest) => {
        const response = await api.post<ApiResponse<SellerResponse>>(
            "/api/sellers/apply",
            data
        );
        return response.data;
    },

    getMyApplication: async () => {
        const response = await api.get<ApiResponse<SellerResponse>>(
            "/api/sellers/me"
        );
        return response.data;
    },
};

export default sellerService;
