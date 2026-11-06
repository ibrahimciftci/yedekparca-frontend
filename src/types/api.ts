
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "CUSTOMER" | "SELLER" | "ADMIN";
    createdAt: string;
}

export interface AdminUserResponse extends UserResponse {
    active: boolean;
}

export interface AdminUserPageResponse {
    content: AdminUserResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: UserResponse;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserUpdateRequest {
    firstName: string;
    lastName: string;
}

export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SellerResponse {
    id: number;
    applicantFirstName: string;
    applicantLastName: string;
    applicantEmail: string;
    storeName: string;
    phone: string;
    city: string;
    district: string;
    description: string;
    status: SellerStatus;
    rejectionReason: string | null;
    appliedAt: string;
    reviewedAt: string | null;
}

export interface SellerApplicationRequest {
    storeName: string;
    phone: string;
    city: string;
    district: string;
    description?: string;
}

export interface SellerReviewRequest {
    rejectionReason: string;
}

export type ProductCondition = "NEW" | "USED";
export type ProductModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProductVehicleCompatibility {
    id?: number;
    vehicleModelId?: number | null;
    vehicleBrandId?: number | null;
    vehicleTypeIds?: number[];
    vehicleBrand: string;
    vehicleModel: string;
    yearFrom: number;
    yearTo: number;
    engineInfo?: string | null;
}

export interface ProductResponse {
    id: number;
    sellerId: number;
    sellerStoreName: string;
    sellerFirstName: string;
    sellerLastName: string;
    sellerEmail: string;
    name: string;
    description: string | null;
    category: string;
    brand: string;
    oemNumber: string | null;
    price: number;
    stockQuantity: number;
    condition: ProductCondition;
    imageUrl: string | null;
    vehicleCompatibilities: ProductVehicleCompatibility[];
    moderationStatus: ProductModerationStatus;
    rejectionReason: string | null;
    reviewedAt: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PublicProductResponse {
    id: number;
    sellerStoreName: string;
    name: string;
    description: string | null;
    category: string;
    brand: string;
    oemNumber: string | null;
    price: number;
    stockQuantity: number;
    condition: ProductCondition;
    imageUrl: string | null;
    vehicleCompatibilities: ProductVehicleCompatibility[];
    createdAt: string;
}

export interface ProductPageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface ProductRequest {
    name: string;
    description?: string;
    category: string;
    brand: string;
    oemNumber?: string;
    price: number;
    stockQuantity: number;
    condition: ProductCondition;
    imageUrl?: string;
    vehicleCompatibilities: ProductVehicleCompatibility[];
}
