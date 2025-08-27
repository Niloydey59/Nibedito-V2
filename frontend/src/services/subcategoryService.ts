import axios from '@/utils/axios';
import { 
    SubcategoryService, 
    Subcategory, 
    ApiResponse 
} from '@/types';

export const subcategoryService: SubcategoryService = {
    async createSubcategory(formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>> {
        try {
            const { data } = await axios.post<ApiResponse<{ subcategory: Subcategory }>>('/subcategories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create subcategory');
        }
    },

    async updateSubcategory(slug: string, formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>> {
        try {
            const { data } = await axios.put<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${slug}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update subcategory');
        }
    },

    async getAllSubcategories(categoryId: string | null = null): Promise<ApiResponse<{ subcategories: Subcategory[] }>> {
        try {
            const queryParams = categoryId ? `?categoryId=${categoryId}` : '';
            const { data } = await axios.get<ApiResponse<{ subcategories: Subcategory[] }>>(`/subcategories${queryParams}`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
        }
    },

    async getActiveSubcategories(categoryId: string | null = null): Promise<Subcategory[]> {
        try {
            const response = await this.getAllSubcategories(categoryId);
            return response.payload?.subcategories.filter(subcategory => subcategory.isActive) || [];
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch active subcategories');
        }
    },

    async deleteSubcategory(slug: string): Promise<ApiResponse> {
        try {
            const { data } = await axios.delete<ApiResponse>(`/subcategories/${slug}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete subcategory');
        }
    },

    async getSubcategory(slug: string): Promise<Subcategory> {
        try {
            const { data } = await axios.get<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${slug}`);
            return data.payload!.subcategory;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch subcategory');
        }
    },

    async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
        try {
            const { data } = await axios.get<ApiResponse<{ subcategories: Subcategory[] }>>(`/subcategories/category/${categoryId}`);
            return data.payload?.subcategories || [];
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch subcategories for category');
        }
    },

    async recalculateProductCounts(): Promise<ApiResponse> {
        try {
            const { data } = await axios.post<ApiResponse>('/subcategories/recalculate-counts');
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to recalculate product counts');
        }
    }
};