import axios from '@/utils/axios';
import { 
    FAQService, 
    FAQ, 
    CreateFAQRequest, 
    UpdateFAQRequest,
    ApiResponse 
} from '@/types';

export const faqService: FAQService = {
    async getAllFaqs(): Promise<ApiResponse<{ faqs: FAQ[] }>> {
        try {
            const { data } = await axios.get<{ success: boolean; count: number; data: FAQ[] }>('/faqs');
            return {
                success: data.success,
                statusCode: 200,
                message: 'FAQs retrieved successfully',
                payload: { faqs: data.data }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch FAQs');
        }
    },

    async getFaqById(id: string): Promise<ApiResponse<{ faq: FAQ }>> {
        try {
            const { data } = await axios.get<{ success: boolean; data: FAQ }>(`/faqs/${id}`);
            return {
                success: data.success,
                statusCode: 200,
                message: 'FAQ retrieved successfully',
                payload: { faq: data.data }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch FAQ');
        }
    },

    async createFaq(faqData: CreateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>> {
        try {
            const { data } = await axios.post<{ success: boolean; message: string; data: FAQ }>('/faqs', faqData);
            return {
                success: data.success,
                statusCode: 201,
                message: data.message,
                payload: { faq: data.data }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create FAQ');
        }
    },

    async updateFaq(id: string, faqData: UpdateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>> {
        try {
            const { data } = await axios.put<{ success: boolean; message: string; data: FAQ }>(`/faqs/${id}`, faqData);
            return {
                success: data.success,
                statusCode: 200,
                message: data.message,
                payload: { faq: data.data }
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update FAQ');
        }
    },

    async deleteFaq(id: string): Promise<ApiResponse> {
        try {
            const { data } = await axios.delete<{ success: boolean; message: string }>(`/faqs/${id}`);
            return {
                success: data.success,
                statusCode: 200,
                message: data.message
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    }
};
