'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import ProductList from '@/components/admin/products/ProductList';
import ProductForm from '@/components/admin/products/ProductForm';
import ProductStats from '@/components/admin/products/ProductStats';
import Error from '@/components/common/Error';
import { productService } from '@/services/productService';
import ProductTester from '@/components/admin/products/ProductTester';

export default function ProductsPage() {
    const router = useRouter();
    const { admin, isLoading } = useAdminAuth();
    const [isAddMode, setIsAddMode] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false
    });
    const [totalStats, setTotalStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        totalVariants: 0,
        activeCategories: 0
    });

    const fetchProducts = async (page = 1) => {
        try {
            setIsLoadingProducts(true);
            const response = await productService.getAllProducts({ page, limit: 12 });
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch products');
            }
            
            setProducts(response.payload.products || []);
            
            // Calculate total variants and value for stats
            const totalVariants = response.payload.products?.reduce(
                (sum, product) => sum + (product.variants?.length || 0), 0
            ) || 0;
            
            const totalValue = response.payload.products?.reduce(
                (sum, product) => sum + (product.price || 0), 0
            ) || 0;
            
            // Get unique categories count
            const uniqueCategories = new Set();
            response.payload.products?.forEach(product => {
                if (product.category?._id) {
                    uniqueCategories.add(product.category._id);
                }
            });
            
            // Handle pagination properties
            setPagination({
                currentPage: response.payload.pagination.currentPage,
                totalPages: response.payload.pagination.totalPages,
                hasPrevPage: response.payload.pagination.currentPage > 1,
                hasNextPage: response.payload.pagination.currentPage < response.payload.pagination.totalPages
            });
            
            // Set stats
            setTotalStats({
                totalProducts: response.payload.pagination.totalProducts || 0,
                totalValue,
                totalVariants,
                activeCategories: uniqueCategories.size
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Failed to fetch products'
            });
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (!isLoading && !admin) {
            router.push('/admin-login');
        } else if (admin) {
            fetchProducts();
        }
    }, [isLoading, admin, router]);

    if (isLoading || !admin) {
        return <div className="admin-loading">Loading...</div>;
    }

    const handleProductClick = (slug) => {
        router.push(`/admin/products/${slug}`);
    };

    return (
        <div className="admin-products">
            <div className="admin-header">
                <h1>Product Management</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsAddMode(!isAddMode)}
                >
                    {isAddMode ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {!isAddMode && !isLoadingProducts && (
                <ProductStats totalStats={totalStats} />
            )}

            {status.message && (
                <Error 
                    type={status.type}
                    message={status.message}
                    className="mb-4"
                />
            )}

            {isAddMode ? (
                <ProductForm 
                    onSuccess={() => {
                        setIsAddMode(false);
                        fetchProducts();
                        setStatus({
                            type: 'success',
                            message: 'Product created successfully'
                        });
                    }}
                    onError={(message) => {
                        setStatus({
                            type: 'error',
                            message: message || 'Failed to create product'
                        });
                    }}
                />
            ) : (
                <ProductList 
                    products={products}
                    isLoading={isLoadingProducts}
                    pagination={pagination}
                    onPageChange={fetchProducts}
                    onProductClick={handleProductClick}
                />
            )}
            <ProductTester />
        </div>
    );
}