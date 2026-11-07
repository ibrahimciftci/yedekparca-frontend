import api from "./api";
import type { ApiResponse } from "../types/api";

export interface CityOption { id: number; name: string; plateCode: string; }
export interface DistrictOption { id: number; cityId: number; name: string; }

const locationService = {
    cities: async () => (await api.get<ApiResponse<CityOption[]>>("/api/locations/cities")).data.data,
    districts: async (cityId: number) => (await api.get<ApiResponse<DistrictOption[]>>(`/api/locations/cities/${cityId}/districts`)).data.data,
};

export default locationService;
