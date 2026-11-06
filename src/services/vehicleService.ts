import api from "./api";
import type { ApiResponse } from "../types/api";

export interface VehicleType { id: number; code: string; name: string; }
export interface VehicleBrand { id: number; name: string; }
export interface VehicleModel { id: number; brandId: number; brandName: string; name: string; vehicleTypeIds: number[]; vehicleTypeNames: string[]; }

let typesRequest: Promise<VehicleType[]> | undefined;
const brandsRequests = new Map<string, Promise<VehicleBrand[]>>();
const modelsRequests = new Map<string, Promise<VehicleModel[]>>();

function data<T>(request: Promise<{ data: ApiResponse<T> }>) {
    return request.then(response => response.data.data);
}

const vehicleService = {
    types: () => {
        typesRequest ??= data(api.get<ApiResponse<VehicleType[]>>("/api/vehicles/types")).catch(error => { typesRequest = undefined; throw error; });
        return typesRequest;
    },
    brands: (typeId?: number) => {
        const key = typeId === undefined ? "all" : String(typeId);
        let request = brandsRequests.get(key);
        if (!request) {
            request = data(api.get<ApiResponse<VehicleBrand[]>>("/api/vehicles/brands", { params: typeId ? { typeId } : {} }))
                .catch(error => { brandsRequests.delete(key); throw error; });
            brandsRequests.set(key, request);
        }
        return request;
    },
    models: (brandId: number, typeId?: number) => {
        const key = `${brandId}:${typeId ?? "all"}`;
        let request = modelsRequests.get(key);
        if (!request) {
            request = data(api.get<ApiResponse<VehicleModel[]>>(`/api/vehicles/brands/${brandId}/models`, { params: typeId ? { typeId } : {} }))
                .catch(error => { modelsRequests.delete(key); throw error; });
            modelsRequests.set(key, request);
        }
        return request;
    },
};

export default vehicleService;
