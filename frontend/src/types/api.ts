export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  payload?: T;
}

export interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  addresses: Address[];
  wishlist?: string[];
  isBanned: boolean;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  newEmail?: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'superadmin';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
