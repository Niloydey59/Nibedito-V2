import axios from '@/utils/axios';
import { API_URL } from '@/config/constants';
import { categoryService } from './categoryService';
import { subcategoryService } from './subcategoryService';

const PRODUCT_URL = `${API_URL}/products`;

export const productService = {
    async createProduct(formData) {
        const response = await fetch(PRODUCT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create product');
        }

        return response.json();
    },

    getAllProducts: async ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        category = '', 
        subcategory = '',
        minPrice = '',
        maxPrice = '',
        inStock,
        sortField = 'createdAt',
        sortOrder = 'desc'
    }) => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(category && { category }),
            ...(subcategory && { subcategory }),
            ...(minPrice !== '' && { minPrice }),
            ...(maxPrice !== '' && { maxPrice }),
            ...(inStock !== undefined && { inStock: inStock.toString() }),
            ...(sortField && { sortField }),
            ...(sortOrder && { sortOrder })
        });

        const response = await fetch(`${PRODUCT_URL}?${queryParams}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch products');
        }

        return response.json();
    },

    getProduct: async (slug) => {
        const response = await fetch(`${PRODUCT_URL}/${slug}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch product');
        }

        const data = await response.json();
        return data.payload.product;
    },

    getProductsByCategory: async (categorySlug, params = {}) => {
        try {
            // First get the category by slug to get its ID
            const categoryData = await categoryService.getCategory(categorySlug);
            
            // Then query products with the category ID
            const response = await axios.get(`${PRODUCT_URL}`, {
                params: { 
                    ...params, 
                    category: categoryData._id // Pass categoryId instead of slug
                }
            });
            return response.data.payload;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProductsBySubcategory: async (subcategorySlug, params = {}) => {
        try {
            console.log(`Fetching products for subcategory slug: ${subcategorySlug}`);
            // First get the subcategory by slug to get its ID
            const subcategoryData = await subcategoryService.getSubcategory(subcategorySlug);
            console.log('Subcategory data:', subcategoryData);
            
            // Then query products with the subcategory ID
            const response = await axios.get(`${PRODUCT_URL}`, {
                params: { 
                    ...params, 
                    subcategory: subcategoryData._id // Pass subcategoryId instead of slug
                }
            });
            console.log('Products response for subcategory:', response.data);
            return response.data.payload;
        } catch (error) {
            console.error('Error fetching products by subcategory:', error);
            throw error.response?.data || error.message;
        }
    },

    updateProduct: async (slug, formData) => {
        try {
            const response = await fetch(`${PRODUCT_URL}/${slug}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update product');
            }

            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteProduct: async (slug) => {
        try {
            const response = await fetch(`${PRODUCT_URL}/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete product');
            }

            return response.json();
        } catch (error) {
            throw error;
        }
    }
};
