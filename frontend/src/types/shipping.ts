import { ApiResponse } from './api';

export interface ShippingRate {
  _id: string;
  region: string;
  cost: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingRateRequest {
  region: string;
  cost: number;
  description?: string;
}

export interface UpdateShippingRateRequest {
  cost?: number;
  description?: string;
}

export interface ShippingService {
  getShippingRates(): Promise<ShippingRate[]>;
  createShippingRate(rateData: CreateShippingRateRequest): Promise<ApiResponse<{ newRate: ShippingRate }>>;
  initializeDefaultRates(): Promise<ApiResponse<{ rates: ShippingRate[] }>>;
  updateShippingRate(rateId: string, updateData: UpdateShippingRateRequest): Promise<ApiResponse<{ updatedRate: ShippingRate }>>;
  deleteShippingRate(rateId: string): Promise<ApiResponse<{ deletedRate: ShippingRate }>>;
}
