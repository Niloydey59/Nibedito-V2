import axios from '@/utils/axios';

export const subcategoryService = {
    createSubcategory: async (formData) => {
        try {
            const { data } = await axios.post('/subcategories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create subcategory');
        }
    },

    updateSubcategory: async (slug, formData) => {
        try {
            const { data } = await axios.put(`/subcategories/${slug}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update subcategory');
        }
    },

    getAllSubcategories: async (categoryId = null) => {
        try {
            const queryParams = categoryId ? `?categoryId=${categoryId}` : '';
            const { data } = await axios.get(`/subcategories${queryParams}`);
            return data.payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
        }
    },

    getActiveSubcategories: async (categoryId = null) => {
        try {
            const { subcategories } = await subcategoryService.getAllSubcategories(categoryId);
            return subcategories.filter(subcategory => subcategory.isActive);
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch active subcategories');
        }
    },

    deleteSubcategory: async (slug) => {
        try {
            const { data } = await axios.delete(`/subcategories/${slug}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete subcategory');
        }
    },

    getSubcategory: async (slug) => {
        try {
            console.log(`Fetching subcategory with slug: ${slug}`);
            const response = await axios.get(`/subcategories/${slug}`);
            console.log('Subcategory response:', response.data);
            return response.data.payload.subcategory;
        } catch (error) {
            console.error('Error in getSubcategory:', error);
            throw error.response?.data || error.message;
        }
    },

    getSubcategoriesByCategory: async (categoryId) => {
        try {
            const { data } = await axios.get(`/subcategories/category/${categoryId}`);
            return data.payload.subcategories;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch subcategories for category');
        }
    },

    recalculateProductCounts: async () => {
        try {
            const { data } = await axios.post('/subcategories/recalculate-counts');
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to recalculate product counts');
        }
    }
}; 