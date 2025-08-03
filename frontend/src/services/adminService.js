import axios from '@/utils/axios';

export const adminService = {
    async login(credentials) {
        try {
            const response = await axios.post('/admin/login', credentials, {
                withCredentials: true
            });
            const { data } = response;
            
            if (data.success && data.payload?.adminInfo) {
                // Store admin info in localStorage
                localStorage.setItem('admin', JSON.stringify(data.payload.adminInfo));
                
                // Store token separately if provided
                if (data.payload.accessToken) {
                    localStorage.setItem('adminToken', data.payload.accessToken);
                }
                
                // Clear any user data to prevent conflicts
                localStorage.removeItem('user');
                
                return data.payload.adminInfo;
            }
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            // Only log response data if it exists
            if (error.response?.data) {
                console.error('Admin login error details:', error.response.data);
            } else if (error.message) {
                console.error('Admin login error:', error.message);
            }
            
            // Handle API errors with proper message
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            
            // Pass through other errors with their message
            if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Login failed');
            }
        }
    },

    async logout() {
        try {
            await axios.post('/admin/logout', {}, {
                withCredentials: true
            });
        } finally {
            // Clear all relevant localStorage items
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            
            // Clear cookies manually as well
            document.cookie = "accessToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
            document.cookie = "refreshToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
        }
    },

    async getCurrentAdmin() {
        try {
            // First check localStorage
            const adminStr = localStorage.getItem('admin');
            if (!adminStr) return null;

            // Verify session with server
            try {
                const { data } = await axios.get('/admin/verify-session', {
                    withCredentials: true
                });

                if (data.success) {
                    // If we have a new admin info in the response, update localStorage
                    if (data.payload?.adminInfo) {
                        localStorage.setItem('admin', JSON.stringify(data.payload.adminInfo));
                        return data.payload.adminInfo;
                    }
                    return JSON.parse(adminStr);
                } else {
                    // If server session is invalid, clear localStorage
                    localStorage.removeItem('admin');
                    localStorage.removeItem('adminToken');
                    return null;
                }
            } catch (error) {
                // If there's any error, clear localStorage and return null
                console.error('Error verifying admin session:', error);
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                return null;
            }
        } catch (error) {
            // If there's any error, clear localStorage and return null
            console.error('Unexpected error in getCurrentAdmin:', error);
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            return null;
        }
    },

    async getUserStats() {
        const { data } = await axios.get('/admin/stats/users');
        return data.payload;
    },

    async getRecentOrders() {
        const { data } = await axios.get('/admin/orders/recent');
        return data.payload;
    },

    async getDashboardStats() {
        const { data } = await axios.get('/admin/stats/dashboard');
        return data.payload;
    },

    async getAllUsers(params) {
        const { page, limit, search, filter, sortBy, order } = params;
        const query = new URLSearchParams({
            page: page || 1,
            limit: limit || 10,
            ...(search && { search }),
            ...(filter && { filter }),
            ...(sortBy && { sortBy }),
            ...(order && { order })
        });

        const { data } = await axios.get(`/admin/users?${query}`);
        return data;
    },

    async banUser(userId) {
        try {
            const { data } = await axios.put(`/admin/users/${userId}/ban`);
            if (data.success) {
                return data.payload;
            }
            throw new Error(data.message || 'Failed to ban user');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to ban user');
        }
    },

    async unbanUser(userId) {
        try {
            const { data } = await axios.put(`/admin/users/${userId}/unban`);
            if (data.success) {
                return data.payload;
            }
            throw new Error(data.message || 'Failed to unban user');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to unban user');
        }
    },

    async deleteUser(userId) {
        const { data } = await axios.delete(`/admin/users/${userId}`);
        return data;
    },

    async getUserById(userId) {
        const { data } = await axios.get(`/admin/users/${userId}`);
        return data;
    },

    async updateUser(userId, userData) {
        const { data } = await axios.patch(`/admin/users/${userId}`, userData);
        return data;
    },

    // Order Management API calls
    async getAllOrders(params = {}) {
        const { status, userId, isGift, page, limit, sortBy, order } = params;
        const query = new URLSearchParams({
            ...(status && { status }),
            ...(userId && { userId }),
            ...(isGift !== undefined && { isGift: isGift.toString() }),
            page: page || 1,
            limit: limit || 10,
            ...(sortBy && { sortBy }),
            ...(order && { order })
        });

        const { data } = await axios.get(`/orders?${query}`);
        return data;
    },

    async getOrderById(orderId) {
        const { data } = await axios.get(`/orders/${orderId}`);
        return data;
    },

    async updateOrderStatus(orderId, status) {
        const { data } = await axios.put(`/orders/${orderId}`, { status });
        return data;
    },

    async updateOrderPaidStatus(orderId, isPaid) {
        const { data } = await axios.put(`/orders/${orderId}/payment-status`, { isPaid });
        return data;
    },

    async deleteOrder(orderId) {
        const { data } = await axios.delete(`/orders/${orderId}`);
        return data;
    }
};