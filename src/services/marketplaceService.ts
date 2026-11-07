import api from "./api";
import type { ApiResponse, ProductCondition, ProductPageResponse } from "../types/api";

export interface VehicleCompatibilityView {id:number|null;vehicleModelId:number|null;vehicleBrandId:number|null;vehicleTypeIds:number[];vehicleBrand:string;vehicleModel:string;yearFrom:number;yearTo:number;engineInfo:string|null;}
export interface OfferView { id:number; catalogProductId:number; name:string; description:string|null; offerDescription:string|null; category:string; brand:string; oemNumber:string|null; price:number; stockQuantity:number; condition:ProductCondition; moderationStatus:"PENDING"|"APPROVED"|"REJECTED"; rejectionReason:string|null; active:boolean; priceUpdatedAt:string; stockUpdatedAt:string; legacyImageUrl:string|null; photos:{id:number;url:string|null;displayOrder:number;primaryPhoto:boolean}[]; vehicleCompatibilities:VehicleCompatibilityView[]; sellerId:number; sellerName:string; sellerPhone:string; whatsappPhone:string|null; city:string; district:string; sellerLogo:string|null; latitude:number|null; longitude:number|null; streetAddress:string|null; createdAt:string; }
export interface CatalogView { id:number; name:string; description:string|null; category:string; brand:string; oemNumber:string|null; moderationStatus:string; active:boolean; vehicleCompatibilities:VehicleCompatibilityView[]; offers:OfferView[]; }
export interface SellerProfile {id:number;storeName:string;phone:string;whatsappPhone:string|null;contactEmail:string|null;city:string;district:string;cityId:number|null;districtId:number|null;streetAddress:string|null;latitude:number|null;longitude:number|null;workingHours:string|null;description:string|null;websiteUrl:string|null;logoUrl:string|null;profileActive:boolean;}
export interface AdminOfferFilters {search?:string;category?:string;brand?:string;sellerId?:number;status?:"PENDING"|"APPROVED"|"REJECTED";active?:boolean;page?:number;size?:number;}
export interface PublicSeller {id:number;storeName:string;city:string;district:string;cityId:number|null;districtId:number|null;description:string|null;logoUrl:string|null;offerCount:number;}
const data=<T,>(p:Promise<{data:ApiResponse<T>}>)=>p.then(r=>r.data.data);
const marketplaceService={
 categories:()=>data(api.get<ApiResponse<string[]>>("/api/catalog/categories")),
 brands:()=>data(api.get<ApiResponse<string[]>>("/api/catalog/brands")),
 catalog:(filters:Record<string,string>,page=0,size=12)=>data(api.get<ApiResponse<ProductPageResponse<CatalogView>>>("/api/catalog/products",{params:{...filters,page,size}})),
 detail:(id:number)=>data(api.get<ApiResponse<CatalogView>>(`/api/catalog/products/${id}`)),
 profile:(id:number)=>data(api.get<ApiResponse<SellerProfile>>(`/api/sellers/${id}/profile`)),
 publicSellers:(params:Record<string,string|number>)=>data(api.get<ApiResponse<ProductPageResponse<PublicSeller>>>("/api/sellers",{params})),
 publicSellerOffers:(id:number,page=0,size=12)=>data(api.get<ApiResponse<ProductPageResponse<OfferView>>>(`/api/sellers/${id}/offers`,{params:{page,size}})),
 adminSellerProfile:(id:number)=>data(api.get<ApiResponse<SellerProfile>>(`/api/admin/sellers/${id}/profile`)),
 setSellerProfileActive:(id:number,active:boolean)=>data(api.put<ApiResponse<SellerProfile>>(`/api/admin/sellers/${id}/profile/active`,{active})),
 favorites:()=>data(api.get<ApiResponse<CatalogView[]>>("/api/me/favorites")),
 favorite:(id:number)=>data(api.post<ApiResponse<void>>(`/api/me/favorites/${id}`)),
 unfavorite:(id:number)=>data(api.delete<ApiResponse<void>>(`/api/me/favorites/${id}`)),
 complain:(body:{sellerId:number;offerId?:number;category:string;description:string})=>data(api.post<ApiResponse<unknown>>("/api/complaints",body)),
 sellerCatalog:(search:string)=>data(api.get<ApiResponse<CatalogView[]>>("/api/seller/catalog",{params:{search}})),
 sellerOffers:(page=0)=>data(api.get<ApiResponse<ProductPageResponse<OfferView>>>("/api/seller/offers",{params:{page,size:20}})),
 createOffer:(body:Record<string,unknown>)=>data(api.post<ApiResponse<OfferView>>("/api/seller/offers",body)),
 updateOffer:(id:number,body:Record<string,unknown>)=>data(api.put<ApiResponse<OfferView>>(`/api/seller/offers/${id}`,body)),
 uploadPhoto:(id:number,file:File)=>{const body=new FormData();body.append("file",file);return api.post<ApiResponse<string>>(`/api/seller/offers/${id}/photos`,body).then(r=>r.data.data);},
 updateProfile:(body:Record<string,unknown>)=>data(api.put<ApiResponse<SellerProfile>>("/api/seller/profile",body)),
 deleteSellerLogo:()=>api.delete<ApiResponse<SellerProfile>>("/api/seller/profile/logo").then(r=>r.data.data),
 uploadSellerLogo:(file:File)=>{const form=new FormData();form.append("file",file);return api.post<ApiResponse<SellerProfile>>("/api/seller/profile/logo",form).then(r=>r.data.data);},
profileMine:()=>data(api.get<ApiResponse<SellerProfile>>("/api/seller/profile")),
 adminOffers:(filters:string|AdminOfferFilters={})=>data(api.get<ApiResponse<ProductPageResponse<OfferView>>>("/api/admin/offers",{params:typeof filters==="string"?{status:filters}:filters})),
 adminOfferDetail:(id:number)=>data(api.get<ApiResponse<OfferView>>(`/api/admin/offers/${id}`)),
 adminCatalog:(status?:string)=>data(api.get<ApiResponse<ProductPageResponse<CatalogView>>>("/api/admin/catalog",{params:status?{status}:{}})),
 adminCatalogDetail:(id:number)=>data(api.get<ApiResponse<CatalogView>>(`/api/admin/catalog/${id}`)),
 setCatalogActive:(id:number,active:boolean)=>data(api.put<ApiResponse<unknown>>(`/api/admin/catalog/${id}/active`,{active})),
 reviewCatalog:(id:number,approved:boolean,reason?:string)=>data(api.put<ApiResponse<unknown>>(`/api/admin/catalog/${id}/${approved?"approve":"reject"}`,approved?{}:{reason})),
 reviewOffer:(id:number,approved:boolean,reason?:string)=>data(api.put<ApiResponse<OfferView>>(`/api/admin/offers/${id}/${approved?"approve":"reject"}`,approved?{}:{reason})),
 setOfferActive:(id:number,active:boolean)=>data(api.put<ApiResponse<OfferView>>(`/api/admin/offers/${id}/active`,{active})),
 deletePhoto:(id:number)=>api.delete(`/api/seller/photos/${id}`),
 reorderPhotos:(id:number,photoIds:number[])=>api.put(`/api/seller/offers/${id}/photos/order`,{photoIds}),
 complaints:(status="OPEN")=>data(api.get<ApiResponse<ProductPageResponse<{id:number;sellerName:string;category:string;description:string;status:string;sellerId:number;offerId:number|null;createdAt:string}>>>("/api/admin/complaints",{params:{status}})),
 resolveComplaint:(id:number,status:string,note:string)=>data(api.put<ApiResponse<unknown>>(`/api/admin/complaints/${id}`,null,{params:{status,note}})),
};
export default marketplaceService;
