export type UserRole = "user" | "admin" | "courier";
export type UserStatus = "pending" | "active" | "suspended" | "deactivated";

export type ParcelType =
  | "document"
  | "package"
  | "fragile"
  | "perishable"
  | "electronics"
  | "other";

export type ParcelStatus =
  | "pending"
  | "processing"
  | "in-transit"
  | "on-hold"
  | "delivered"
  | "returned"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  isAdmin: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  parcels?: Parcel[];
}

export interface Location {
  address: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: number[];
}

export interface Recipient {
  name: string;
  email: string;
  phone?: string;
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: "cm" | "in";
}

export interface Price {
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "JPY";
}

export interface Parcel {
  _id: string;
  id?: string;
  trackingCode: string;
  parcelType: ParcelType;
  description?: string;
  sender: User | string;
  weight: number;
  dimensions?: Dimensions;
  price: Price;
  status: ParcelStatus;
  locationFrom?: Location;
  locationTo?: Location;
  presentLocation?: Location;
  notes?: string;
  recipient?: Recipient;
  estimatedDelivery?: string;
  deliveryDate?: string;
  courierAssigned?: string;
  paymentStatus: PaymentStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/** A trimmed public tracking view (no sender). */
export interface TrackingInfo {
  trackingCode: string;
  status: ParcelStatus;
  createdAt: string;
  estimatedDelivery?: string;
  locationFrom?: Location;
  locationTo?: Location;
  presentLocation?: Location;
  progress: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ListResponse<T> {
  status: "success";
  data: T[];
  pagination: PaginationMeta;
}

export interface ItemResponse<T> {
  status: "success";
  data: T;
  message?: string;
}

export interface AuthResponse {
  status: "success";
  message: string;
  token: string;
}

export interface MessageResponse {
  status: string;
  message: string;
}

/** Shape of an error payload returned by the API. */
export interface ApiErrorBody {
  status: "error";
  statusCode: number;
  message: string;
  errors?: { message: string; path: (string | number)[] }[];
}

/** Decoded JWT payload. */
export interface TokenClaims {
  id: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
