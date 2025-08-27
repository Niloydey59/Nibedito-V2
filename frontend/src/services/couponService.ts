import axios from '@/utils/axios';
import { 
    CouponService, 
    CreateCouponRequest, 
    UpdateCouponRequest, 
    PreviewCouponRequest,
    ApiResponse,
    Coupon,
    CouponPreviewResponse
} from '@/types';

export const couponService: CouponService = {
    async getAllCoupons(): Promise<ApiResponse<{ coupons: Coupon[] }>> {
        try {
            const { data } = await axios.get<ApiResponse<Coupon[]>>('/coupon');
            return {
                ...data,
                payload: { coupons: data.payload || [] }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
        }
    },

    async getCouponById(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>> {
        try {
            const { data } = await axios.get<ApiResponse<Coupon>>(`/coupon/${couponId}`);
            return {
                ...data,
                payload: { coupon: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch coupon');
        }
    },

    async createCoupon(couponData: CreateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> {
        try {
            const { data } = await axios.post<ApiResponse<Coupon>>('/coupon', couponData);
            return {
                ...data,
                payload: { coupon: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create coupon');
        }
    },

    async updateCoupon(couponId: string, couponData: UpdateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> {
        try {
            const { data } = await axios.put<ApiResponse<Coupon>>(`/coupon/${couponId}`, couponData);
            return {
                ...data,
                payload: { coupon: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update coupon');
        }
    },

    async deleteCoupon(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>> {
        try {
            const { data } = await axios.delete<ApiResponse<Coupon>>(`/coupon/${couponId}`);
            return {
                ...data,
                payload: { coupon: data.payload! }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete coupon');
        }
    },

    async previewCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>> {
        try {
            const { data } = await axios.post<ApiResponse<CouponPreviewResponse>>('/coupon/preview', {
                couponCode: couponData.couponCode,
                shippingRegion: couponData.shippingRegion
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to preview coupon');
        }
    },

    async applyCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>> {
        try {
            const { data } = await axios.post<ApiResponse<CouponPreviewResponse>>('/coupon/apply', {
                couponCode: couponData.couponCode,
                shippingRegion: couponData.shippingRegion
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to apply coupon');
        }
    }
};