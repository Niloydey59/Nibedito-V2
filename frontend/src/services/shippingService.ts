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
        const { data } = await axios.get<ApiResponse<ShippingRate[]>>('/shipping/rates');
        return data.payload || [];
    },

    async createShippingRate(rateData: CreateShippingRateRequest): Promise<ApiResponse<{ newRate: ShippingRate }>> {
        const { data } = await axios.post<ApiResponse<ShippingRate>>('/shipping/rates', rateData);
        return {
            ...data,
            payload: { newRate: data.payload! }
        };
    },

    async initializeDefaultRates(): Promise<ApiResponse<{ rates: ShippingRate[] }>> {
        const { data } = await axios.post<ApiResponse<ShippingRate[]>>('/shipping/rates/initialize');
        return {
            ...data,
            payload: { rates: data.payload || [] }
        };
    },

    async updateShippingRate(rateId: string, updateData: UpdateShippingRateRequest): Promise<ApiResponse<{ updatedRate: ShippingRate }>> {
        const { data } = await axios.put<ApiResponse<ShippingRate>>(`/shipping/rates/${rateId}`, updateData);
        return {
            ...data,
            payload: { updatedRate: data.payload! }
        };
    },

    async deleteShippingRate(rateId: string): Promise<ApiResponse<{ deletedRate: ShippingRate }>> {
        const { data } = await axios.delete<ApiResponse<ShippingRate>>(`/shipping/rates/${rateId}`);
        return {
            ...data,
            payload: { deletedRate: data.payload! }
        };
    }
};