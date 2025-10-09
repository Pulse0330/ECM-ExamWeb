// import crypto from "crypto";
// import type { LoginPayload, LoginType } from "@/types/login";

// import api from "./axios";

// interface ProductReview {
//   rating: number;
//   comment: string;
//   date: string;
//   reviewerName: string;
//   reviewerEmail: string;
// }

// interface ProductDimensions {
//   width: number;
//   height: number;
//   depth: number;
// }

// interface ProductMeta {
//   createdAt: string;
//   updatedAt: string;
//   barcode: string;
//   qrCode: string;
// }

// export interface Product {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
//   price: number;
//   discountPercentage: number;
//   rating: number;
//   stock: number;
//   tags: string[];
//   brand: string;
//   sku: string;
//   weight: number;
//   dimensions: ProductDimensions;
//   warrantyInformation: string;
//   shippingInformation: string;
//   availabilityStatus: string;
//   reviews: ProductReview[];
//   returnPolicy: string;
//   minimumOrderQuantity: number;
//   meta: ProductMeta;
//   thumbnail: string;
//   images: string[];
// }

// interface ProductListResponse {
//   products: Product[];
//   total: number;
//   skip: number;
//   limit: number;
// }

// //--------------------------------------------------------

// export const LoginUser = async ({
//   username,
//   password,
// }: LoginPayload): Promise<LoginType> => {
//   const hashPassword = crypto
//     .createHash("md5")
//     .update(password, "ucs-2")
//     .digest("hex");
//   const res = await api.post<LoginType>("/login", {
//     username,
//     password: hashPassword,
//   "deviceid":"",
//         "devicemodel":"",
//   });
//   return res.data;
// };


