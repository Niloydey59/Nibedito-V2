import axios from '@/utils/axios';

// Get all active FAQs
export const getAllFaqs = async () => {
    try {
        const response = await axios.get('/faqs');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch FAQs');
    }
};

// Get a single FAQ by ID
export const getFaqById = async (id) => {
    try {
        const response = await axios.get(`/faqs/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch FAQ');
    }
};

// Create a new FAQ (admin only)
export const createFaq = async (faqData) => {
    try {
        const response = await axios.post('/faqs', faqData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create FAQ');
    }
};

// Update an existing FAQ (admin only)
export const updateFaq = async (id, faqData) => {
    try {
        const response = await axios.put(`/faqs/${id}`, faqData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update FAQ');
    }
};

// Delete a FAQ (admin only)
export const deleteFaq = async (id) => {
    try {
        const response = await axios.delete(`/faqs/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete FAQ');
    }
};
