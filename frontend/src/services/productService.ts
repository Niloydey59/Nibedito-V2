import axios from '@/utils/axios';
import { API_URL } from '@/config/constants';
import { categoryService } from './categoryService';
import { subcategoryService } from './subcategoryService';
import { 
    ProductService, 
    Product, 
    GetProductsParams, 
    ProductsResponse, 
    ApiResponse,
    Category,
    Subcategory
} from '@/types';

const PRODUCT_URL = `${API_URL}/products`;

export const productService: ProductService = {
    async createProduct(formData: FormData): Promise<ApiResponse<{ product: Product }>> {
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

    async getAllProducts(params: GetProductsParams): Promise<ApiResponse<ProductsResponse>> {
        const { 
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
        } = params;

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

    async getProduct(slug: string): Promise<Product> {
        const response = await fetch(`${PRODUCT_URL}/${slug}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch product');
        }

        const data = await response.json();
        return data.payload.product as Product;
    },

    async getProductsByCategory(categorySlug: string, params: Record<string, any> = {}): Promise<ProductsResponse> {
        try {
            // First get the category by slug to get its ID
            const categoryData = await categoryService.getCategory(categorySlug) as Category;
            
            // Then query products with the category ID
            const response = await axios.get<ApiResponse<ProductsResponse>>(PRODUCT_URL, {
                params: { 
                    ...params, 
                    category: categoryData._id // Pass categoryId instead of slug
                }
            });
            return response.data.payload!;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    async getProductsBySubcategory(subcategorySlug: string, params: Record<string, any> = {}): Promise<ProductsResponse> {
        try {
            // First get the subcategory by slug to get its ID
            const subcategoryData = await subcategoryService.getSubcategory(subcategorySlug) as Subcategory;
            
            // Then query products with the subcategory ID
            const response = await axios.get<ApiResponse<ProductsResponse>>(PRODUCT_URL, {
                params: { 
                    ...params, 
                    subcategory: subcategoryData._id // Pass subcategoryId instead of slug
                }
            });
            return response.data.payload!;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    async updateProduct(slug: string, formData: FormData): Promise<ApiResponse<{ product: Product }>> {
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
        } catch (error: any) {
            throw error;
        }
    },

    async deleteProduct(slug: string): Promise<ApiResponse<{ product: Product }>> {
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
        } catch (error: any) {
            throw error;
        }
    }
};
