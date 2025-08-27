import axios from '@/utils/axios';
import { 
    CategoryService, 
    Category, 
    ApiResponse 
} from '@/types';

export const categoryService: CategoryService = {
    async createCategory(formData: FormData): Promise<ApiResponse<{ category: Category }>> {
        try {
            const { data } = await axios.post<ApiResponse<{ category: Category }>>('/categories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create category');
        }
    },

    async updateCategory(slug: string, formData: FormData): Promise<ApiResponse<{ category: Category }>> {
        try {
            const { data } = await axios.put<ApiResponse<{ category: Category }>>(`/categories/${slug}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update category');
        }
    },

    async getAllCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
        try {
            const { data } = await axios.get<ApiResponse<{ categories: Category[] }>>('/categories');
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch categories');
        }
    },

    async getActiveCategories(): Promise<Category[]> {
        try {
            const response = await this.getAllCategories();
            return response.payload?.categories.filter(category => category.isActive) || [];
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch active categories');
        }
    },

    async deleteCategory(slug: string): Promise<ApiResponse> {
        try {
            const { data } = await axios.delete<ApiResponse>(`/categories/${slug}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete category');
        }
    },

    async getCategory(slug: string): Promise<Category> {
        try {
            const { data } = await axios.get<ApiResponse<{ category: Category }>>(`/categories/${slug}`);
            return data.payload!.category;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch category');
        }
    },

    async recalculateProductCounts(): Promise<ApiResponse> {
        try {
            const { data } = await axios.post<ApiResponse>('/categories/recalculate-counts');
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to recalculate product counts');
        }
    }
};
