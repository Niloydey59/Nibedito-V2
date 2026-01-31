// Update your axios.ts file with better error handling
import axios from 'axios';
import { ApiResponse } from '@/types/api';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Track if we're currently refreshing the token to prevent multiple refresh requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// Helper to show toast notification (only in browser)
const showErrorToast = (message: string) => {
    if (typeof window !== 'undefined') {
        // Dynamically import toast to avoid SSR issues
        import('react-hot-toast').then(({ default: toast }) => {
            toast.error(message, {
                duration: 5000,
                position: 'top-right',
            });
        });
    }
};

// Helper to get user-friendly error message
const getErrorMessage = (error: any): string => {
    const status = error.response?.status;
    const errorData = error.response?.data as ApiResponse | undefined;

    // Custom messages for common HTTP status codes
    switch (status) {
        case 429:
            return 'Too many requests. Please wait a moment and try again.';
        case 500:
            return 'Server error. Please try again later.';
        case 503:
            return 'Service temporarily unavailable. Please try again later.';
        case 404:
            return errorData?.message || 'Resource not found.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 400:
            return errorData?.message || 'Invalid request. Please check your input.';
        default:
            return errorData?.message || 'An unexpected error occurred. Please try again.';
    }
};

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            config.headers['Authorization'] = `Bearer ${adminToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const path = typeof window !== 'undefined' ? window.location.pathname : '';

        // Special handling for login pages - don't try to refresh token
        if (path === '/login' || path === '/admin-login' || originalRequest.url?.includes('/login')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If we're already refreshing, add this request to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry the original request after token refresh
                        return instance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                const response = await instance.get('/auth/refresh-token');

                if (response.data.success) {
                    // Process all queued requests
                    processQueue(null);
                    isRefreshing = false;

                    // Retry the original request with new token
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                // Process all queued requests with error
                processQueue(refreshError);
                isRefreshing = false;

                // If refresh token is also expired or invalid
                if (typeof window !== 'undefined') {
                    if (window.location.pathname.startsWith('/admin')) {
                        localStorage.removeItem('admin');
                        localStorage.removeItem('adminToken');
                        showErrorToast('Session expired. Please login again.');
                        window.location.href = '/admin-login';
                    } else {
                        localStorage.removeItem('user');
                        showErrorToast('Session expired. Please login again.');
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        // Get user-friendly error message
        const errorMessage = getErrorMessage(error);
        error.message = errorMessage;

        // Show toast notification for errors (except 401 which is handled above)
        if (error.response?.status !== 401) {
            showErrorToast(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default instance;