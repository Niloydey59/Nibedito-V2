import axios from '@/utils/axios';

export const authService = {
    async login(formData) {
        try {
            console.log('Sending login request with:', formData);

            const { data } = await axios.post('/auth/login', {
                emailOrPhone: formData.emailOrPhone,
                password: formData.password
            });

            console.log('Login response:', data);

            if (data.success && data.payload?.user) {
                // Clear any existing admin data to prevent conflicts
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                
                // Set user data
                localStorage.setItem('user', JSON.stringify(data.payload.user));
                
                return {
                    success: true,
                    user: data.payload.user,
                    message: data.message
                };
            }
            throw new Error(data.message || 'Authentication failed');
        } catch (error) {
            // Only log response data if it exists
            if (error.response?.data) {
                console.error('Login error details:', error.response.data);
            } else if (error.message) {
                console.error('Login error:', error.message);
            }
            
            // Handle API errors with proper message
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            
            // Handle network or unknown errors
            if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Login failed. Please try again.');
            }
        }
    },

    async register(userData) {
        try {
            const { data } = await axios.post('/auth/process-register', {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                address: {
                    street: userData.street,
                    city: userData.city,
                    state: userData.state,
                    postalCode: userData.postalCode
                }
            });

            if (data.success) {
                return {
                    success: true,
                    message: data.message,
                    email: userData.email
                };
            }
            throw new Error(data.message || 'Registration failed');
        } catch (error) {
            console.error('Registration error:', error.response?.data || error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Registration failed. Please try again.');
        }
    },

    async addAddress(userId, addressData) {
        try {
            const { data } = await axios.post(`/users/${userId}/addresses`, addressData);
            if (data.success && data.payload?.user) {
                localStorage.setItem('user', JSON.stringify(data.payload.user));
                return data.payload.user;
            }
            throw new Error(data.message || 'Failed to add address');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add address');
        }
    },

    async updateAddress(userId, addressId, addressData) {
        try {
            const { data } = await axios.put(`/users/${userId}/addresses/${addressId}`, addressData);
            if (data.success && data.payload?.user) {
                localStorage.setItem('user', JSON.stringify(data.payload.user));
                return data.payload.user;
            }
            throw new Error(data.message || 'Failed to update address');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update address');
        }
    },

    async deleteAddress(userId, addressId) {
        try {
            const { data } = await axios.delete(`/users/${userId}/addresses/${addressId}`);
            if (data.success && data.payload?.user) {
                localStorage.setItem('user', JSON.stringify(data.payload.user));
                return data.payload.user;
            }
            throw new Error(data.message || 'Failed to delete address');
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete address');
        }
    },

    async logout() {
        try {
            await axios.post('/auth/logout');
            // Clear all relevant localStorage items
            localStorage.removeItem('user');
            // Just in case there are any admin data left
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            
            // Clear cookies manually as well
            document.cookie = "accessToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
            document.cookie = "refreshToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
        } catch (error) {
            console.error('Logout error:', error);
            // Still remove user from localStorage even if API call fails
            localStorage.removeItem('user');
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
        }
    },

    async getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;

            const user = JSON.parse(userStr);
            
            try {
                const { data } = await axios.get(`/users/${user._id}`);
                
                if (data.success && data.payload?.user) {
                    localStorage.setItem('user', JSON.stringify(data.payload.user));
                    return data.payload.user;
                }
                return null;
            } catch (error) {
                console.error('Error getting current user:', error);
                
                // Only attempt refresh token if status is 401 and it's not already a refresh attempt
                if (error.response?.status === 401 && !error.config?._isRefreshAttempt) {
                    try {
                        // Mark this as a refresh attempt to prevent infinite loops
                        const refreshResponse = await axios.get('/auth/refresh-token', {
                            _isRefreshAttempt: true
                        });
                        
                        if (refreshResponse.data.success) {
                            // Retry getting user data with a fresh request instead of recursion
                            const retryResponse = await axios.get(`/users/${user._id}`);
                            if (retryResponse.data.success && retryResponse.data.payload?.user) {
                                localStorage.setItem('user', JSON.stringify(retryResponse.data.payload.user));
                                return retryResponse.data.payload.user;
                            }
                        }
                        // If we get here, the refresh succeeded but getting user failed
                        this.logout();
                        return null;
                    } catch (refreshError) {
                        // Refresh token failed
                        this.logout();
                        return null;
                    }
                }
                
                // For other errors, logout and return null
                this.logout();
                return null;
            }
        } catch (error) {
            console.error('Unexpected error in getCurrentUser:', error);
            this.logout();
            return null;
        }
    },

    async forgotPassword(email) {
        const { data } = await axios.post('/auth/forgot-password', { emailOrPhone: email });
        return data;
    },

    async resetPassword(token, newPassword) {
        const { data } = await axios.post('/auth/reset-password', {
            token: token,
            newPassword: newPassword
        });
        return data;
    },

    async activateAccount(token) {
        const { data } = await axios.post('/auth/activate-account', { token });
        return data;
    },

    async resendVerificationEmail(email) {
        try {
            const { data } = await axios.post('/auth/resend-verification', { email });
            return data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to resend verification email');
            }
            throw new Error(error.message || 'Network error occurred');
        }
    },

    async changePassword(currentPassword, newPassword) {
        try {
            const { data } = await axios.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            if (data.success) {
                return {
                    success: true,
                    message: data.message
                };
            }
            throw new Error(data.message || 'Failed to change password');
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to change password. Please try again.');
        }
    }
};