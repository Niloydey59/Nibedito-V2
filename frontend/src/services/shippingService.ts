import axios from '@/utils/axios';
import { 
    ShippingService, 
    ShippingRate, 
    CreateShippingRateRequest, 
    UpdateShippingRateRequest,
    ApiResponse 
} from '@/types';

export const shippingService: ShippingService = {
    async getShippingRates(): Promise<ShippingRate[]> {
        try {
            const { data } = await axios.get<ApiResponse<ShippingRate[]>>('/shipping/rates');
            return data.payload || [];
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch shipping rates');
        }
    },

    async createShippingRate(rateData: CreateShippingRateRequest): Promise<ApiResponse<{ newRate: ShippingRate }>> {
        try {
            const { data } = await axios.post<ApiResponse<ShippingRate>>('/shipping/rates', rateData);
            return {
                ...data,
                payload: { newRate: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create shipping rate');
        }
    },

    async initializeDefaultRates(): Promise<ApiResponse<{ rates: ShippingRate[] }>> {
        try {
            const { data } = await axios.post<ApiResponse<ShippingRate[]>>('/shipping/rates/initialize');
            return {
                ...data,
                payload: { rates: data.payload || [] }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to initialize default rates');
        }
    },

    async updateShippingRate(rateId: string, updateData: UpdateShippingRateRequest): Promise<ApiResponse<{ updatedRate: ShippingRate }>> {
        try {
            const { data } = await axios.put<ApiResponse<ShippingRate>>(`/shipping/rates/${rateId}`, updateData);
            return {
                ...data,
                payload: { updatedRate: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update shipping rate');
        }
    },

    async deleteShippingRate(rateId: string): Promise<ApiResponse<{ deletedRate: ShippingRate }>> {
        try {
            const { data } = await axios.delete<ApiResponse<ShippingRate>>(`/shipping/rates/${rateId}`);
            return {
                ...data,
                payload: { deletedRate: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete shipping rate');
        }
    }
};