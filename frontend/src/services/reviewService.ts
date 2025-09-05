import axios from '@/utils/axios';
import { 
    ReviewService, 
    CreateReviewRequest, 
    UpdateReviewRequest,
    GetReviewsParams,
    GetProductReviewsParams,
    GetUserReviewsParams,
    Review,
    ReviewsResponse,
    ReviewStats,
    MarkHelpfulResponse,
    ApiResponse 
} from '@/types';

export const reviewService: ReviewService = {
    async createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
        const formData = new FormData();
        formData.append('product', reviewData.product);
        formData.append('rating', reviewData.rating.toString());
        
        if (reviewData.comment) {
            formData.append('comment', reviewData.comment);
        }

        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const { data } = await axios.post<ApiResponse<{ review: Review }>>('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async getReviews(params: GetReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit, search } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(search && { search })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews?${query}`);
        return data;
    },

    async getReviewById(reviewId: string): Promise<ApiResponse<{ review: Review }>> {
        const { data } = await axios.get<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`);
        return data;
    },

    async getProductReviews(productId: string, params: GetProductReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit, rating, sortBy, sortOrder } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(rating && { rating: rating.toString() }),
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews/product/${productId}?${query}`);
        return data;
    },

    async getUserReviews(params: GetUserReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews/user?${query}`);
        return data;
    },

    async updateReview(reviewId: string, reviewData: UpdateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
        const formData = new FormData();
        
        if (reviewData.rating !== undefined) {
            formData.append('rating', reviewData.rating.toString());
        }
        
        if (reviewData.comment !== undefined) {
            formData.append('comment', reviewData.comment);
        }

        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const { data } = await axios.put<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async deleteReview(reviewId: string): Promise<ApiResponse<{ review: Review }>> {
        const { data } = await axios.delete<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`);
        return data;
    },

    async markReviewHelpful(reviewId: string): Promise<ApiResponse<MarkHelpfulResponse>> {
        const { data } = await axios.post<ApiResponse<MarkHelpfulResponse>>(`/reviews/${reviewId}/helpful`);
        return data;
    },

    async getReviewStats(productId: string): Promise<ApiResponse<ReviewStats>> {
        const { data } = await axios.get<ApiResponse<ReviewStats>>(`/reviews/product/${productId}/stats`);
        return data;
    }
};
