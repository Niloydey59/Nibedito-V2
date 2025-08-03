'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FiBox, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

export default function ProductList({ products, isLoading, pagination, onPageChange, onProductClick }) {
    useEffect(() => {
        const descriptions = document.querySelectorAll('.product-description');
        descriptions.forEach(desc => {
            if (desc.scrollHeight > desc.clientHeight) {
                desc.classList.add('truncated');
            } else {
                desc.classList.remove('truncated');
            }
        });
    }, [products]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="product-list">
            <div className="products-grid">
                {products.map((product) => (
                    <div 
                        key={product._id} 
                        className="product-card"
                        onClick={() => onProductClick(product.slug)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="product-image">
                            <Image
                                src={product.thumbnailImage}
                                alt={product.name}
                                width={200}
                                height={200}
                                className="thumbnail"
                            />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-description-preview">
                                <MarkdownRenderer markdown={product.description} />
                            </div>
                            <div className="admin-product-meta">
                                <span className="price">
                                    <FiTag /> ৳ {product.price}
                                </span>
                                <span className="variants">
                                    <FiBox /> {product.variants?.length || 0} Variants
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-icon"
                >
                    <FiChevronLeft />
                </button>
                <div className="pagination-pages">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`page-number ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    )).slice(
                        Math.max(0, pagination.currentPage - 3),
                        Math.min(pagination.totalPages, pagination.currentPage + 2)
                    )}
                </div>
                <span className="page-info">
                    Page {pagination.currentPage} of {pagination.totalPages || 1}
                </span>
                <button
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-icon"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
} 