import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all coupons (admin only)
export const getAllCoupons = async () => {
    try {
        const response = await axios.get(`${API_URL}/coupon`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get coupon by ID (admin only)
export const getCouponById = async (couponId) => {
    try {
        const response = await axios.get(`${API_URL}/coupon/${couponId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Create new coupon (admin only)
export const createCoupon = async (couponData) => {
    try {
        const response = await axios.post(`${API_URL}/coupon`, couponData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update coupon (admin only)
export const updateCoupon = async (couponId, couponData) => {
    try {
        const response = await axios.put(`${API_URL}/coupon/${couponId}`, couponData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete coupon (admin only)
export const deleteCoupon = async (couponId) => {
    try {
        const response = await axios.delete(`${API_URL}/coupon/${couponId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Preview coupon (does not affect usage count)
export const previewCoupon = async (couponData) => {
    try {
        const response = await axios.post(`${API_URL}/coupon/preview`, {
            couponCode: couponData.couponCode,
            shippingRegion: couponData.shippingRegion
        }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Apply coupon (affects usage count - use during order placement)
export const applyCoupon = async (couponData) => {
    try {
        const response = await axios.post(`${API_URL}/coupon/apply`, {
            couponCode: couponData.couponCode,
            shippingRegion: couponData.shippingRegion
        }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 