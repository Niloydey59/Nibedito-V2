import axios from '@/utils/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all shipping rates
export const getShippingRates = async () => {
    try {
        const response = await axios.get(`${API_URL}/shipping/rates`, {
            withCredentials: true,
        });
        return response.data.payload;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Create new shipping rate (admin only)
export const createShippingRate = async (rateData) => {
    try {
        const response = await axios.post(`${API_URL}/shipping/rates`, rateData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Initialize default shipping rates (admin only)
export const initializeDefaultRates = async () => {
    try {
        const response = await axios.post(`${API_URL}/shipping/rates/initialize`, {}, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update shipping rate (admin only)
export const updateShippingRate = async (rateId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/shipping/rates/${rateId}`, updateData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete shipping rate (admin only)
export const deleteShippingRate = async (rateId) => {
    try {
        const response = await axios.delete(`${API_URL}/shipping/rates/${rateId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 