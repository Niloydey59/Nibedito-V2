import axios from '@/utils/axios';

export const orderService = {
    createOrder: async (orderData) => {
        try {
            const response = await axios.post('/orders', orderData);
            return {
                success: true,
                data: response.data.payload
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create order'
            };
        }
    },

    getUserOrders: async () => {
        try {
            const response = await axios.get('/orders/user-orders');
            return {
                success: true,
                data: response.data.payload
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch orders'
            };
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await axios.get(`/orders/${orderId}`);
            return {
                success: true,
                data: response.data.payload
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch order details'
            };
        }
    }
};
