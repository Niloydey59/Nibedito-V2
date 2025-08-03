'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiBox, FiRefreshCw, FiFolder, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { subcategoryService } from '@/services/subcategoryService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SubcategoryForm from './SubcategoryForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function SubcategoryList({ subcategories, categories, isLoading, onUpdateSuccess, onError }) {
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

    const handleDeleteClick = (subcategory) => {
        setSubcategoryToDelete(subcategory);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!subcategoryToDelete) return;
        
        try {
            setIsDeleting(true);
            await subcategoryService.deleteSubcategory(subcategoryToDelete.slug);
            
            // Update the local state immediately
            const updatedSubcategories = subcategories.filter(
                subcat => subcat.slug !== subcategoryToDelete.slug
            );
            
            // Close dialog first
            setShowDeleteDialog(false);
            setSubcategoryToDelete(null);
            setIsDeleting(false);
            
            // Then update the state and scroll
            onUpdateSuccess('Subcategory deleted successfully', updatedSubcategories);
            
            // Use setTimeout to ensure state updates are processed
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            
        } catch (error) {
            onError(error.message);
            setShowDeleteDialog(false);
            setSubcategoryToDelete(null);
            setIsDeleting(false);
            
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    };

    const handleStatusToggle = async (subcategory) => {
        try {
            const formData = new FormData();
            formData.append('isActive', !subcategory.isActive);
            formData.append('category', subcategory.category._id);
            
            const response = await subcategoryService.updateSubcategory(subcategory.slug, formData);
            if (response.statusCode === 200) {
                onUpdateSuccess('Subcategory status updated successfully');
            }
        } catch (error) {
            onError(error.message);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    const toggleCategoryExpansion = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const truncateDescription = (description, maxLength = 100) => {
        if (!description) return '';
        return description.length > maxLength
            ? `${description.substring(0, maxLength)}...`
            : description;
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (subcategories.length === 0) {
        return <div className="no-data-message">No subcategories found.</div>;
    }

    // Group subcategories by category
    const subcategoriesByCategory = {};
    subcategories.forEach(subcategory => {
        const categoryId = subcategory.category._id || subcategory.category;
        if (!subcategoriesByCategory[categoryId]) {
            subcategoriesByCategory[categoryId] = [];
        }
        subcategoriesByCategory[categoryId].push(subcategory);
    });

    return (
        <div className="subcategory-list">
            <div className="subcategory-actions-header">
                <button 
                    className="btn btn-secondary btn-refresh"
                    onClick={async () => {
                        try {
                            const response = await subcategoryService.recalculateProductCounts();
                            onUpdateSuccess('Product counts updated successfully', response.payload.subcategories);
                        } catch (error) {
                            onError(error.message);
                        }
                    }}
                    title="Recalculate product counts"
                >
                    <FiRefreshCw className="refresh-icon" /> Update Counts
                </button>
            </div>
            
            {Object.keys(subcategoriesByCategory).map(categoryId => {
                const categoryName = getCategoryName(categoryId);
                const categorySubcategories = subcategoriesByCategory[categoryId];
                const isExpanded = expandedCategories[categoryId] !== false; // Default to expanded
                
                return (
                    <div key={categoryId} className="category-group">
                        <div 
                            className="category-header" 
                            onClick={() => toggleCategoryExpansion(categoryId)}
                        >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                            <h2>{categoryName} ({categorySubcategories.length})</h2>
                        </div>
                        
                        {isExpanded && (
                            <div className="category-subcategories">
                                {categorySubcategories.map(subcategory => (
                                    <div key={subcategory._id} className="subcategory-item">
                                        {editingSubcategory?.slug === subcategory.slug ? (
                                            <SubcategoryForm 
                                                subcategory={subcategory}
                                                categories={categories}
                                                onSuccess={() => {
                                                    setEditingSubcategory(null);
                                                    onUpdateSuccess('Subcategory updated successfully');
                                                }}
                                                onError={onError}
                                                onCancel={() => setEditingSubcategory(null)}
                                            />
                                        ) : (
                                            <div className="subcategory-content">
                                                <div className="subcategory-image-admin">
                                                    {subcategory.image ? (
                                                        <Image
                                                            src={subcategory.image}
                                                            alt={subcategory.name}
                                                            width={120}
                                                            height={120}
                                                            className="subcategory-thumb"
                                                        />
                                                    ) : (
                                                        <div className="subcategory-image-placeholder">
                                                            {subcategory.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="subcategory-info">
                                                    <div className="subcategory-header">
                                                        <div className="subcategory-title">
                                                            <h3>{subcategory.name}</h3>
                                                            <div className="status-badge-wrapper" onClick={() => handleStatusToggle(subcategory)}>
                                                                {subcategory.isActive ? (
                                                                    <span className="status-badge active">
                                                                        <FiCheck size={14} />
                                                                        <span>Active</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="status-badge inactive">
                                                                        <FiX size={14} />
                                                                        <span>Inactive</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="subcategory-description">{truncateDescription(subcategory.description)}</p>
                                                    <div className="subcategory-footer">
                                                        <span className="product-count">
                                                            <FiBox size={16} />
                                                            {subcategory.productCount || 0} Products
                                                        </span>
                                                        <div className="subcategory-actions">
                                                            <button
                                                                onClick={() => setEditingSubcategory(subcategory)}
                                                                className="btn btn-icon"
                                                                title="Edit subcategory"
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(subcategory)}
                                                                className="btn btn-icon btn-danger"
                                                                title="Delete subcategory"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            <ConfirmDialog 
                isOpen={showDeleteDialog}
                title="Delete Subcategory"
                message={
                    <div className="delete-dialog-content">
                        <p>Are you sure you want to delete <strong>{subcategoryToDelete?.name}</strong>?</p>
                        <p className="delete-warning">This action cannot be undone. All associated data will be permanently removed.</p>
                    </div>
                }
                confirmLabel={isDeleting ? "Deleting..." : "Delete Subcategory"}
                confirmButtonProps={{
                    className: "btn btn-danger",
                    disabled: isDeleting
                }}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setSubcategoryToDelete(null);
                }}
                actionType="delete"
            />
        </div>
    );
} 