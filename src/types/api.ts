
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
