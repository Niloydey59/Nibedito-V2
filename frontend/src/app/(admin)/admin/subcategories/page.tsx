'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import SubcategoryList from '@/components/admin/subcategories/SubcategoryList';
import SubcategoryForm from '@/components/admin/subcategories/SubcategoryForm';
import SubcategoryStats from '@/components/admin/subcategories/SubcategoryStats';
import SubcategoryTester from '@/components/admin/subcategories/SubcategoryTester';
import { subcategoryService } from '@/services/subcategoryService';
import { categoryService } from '@/services/categoryService';
import Error from '@/components/common/Error';

export default function SubcategoriesPage() {
    const router = useRouter();
    const { admin, isLoading } = useAdminAuth();
    const [isAddMode, setIsAddMode] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(true);

    useEffect(() => {
        if (!isLoading && !admin) {
            router.push('/admin-login');
        }
    }, [admin, isLoading, router]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Failed to fetch categories'
            });
        }
    };

    const fetchSubcategories = async (categoryId = null) => {
        try {
            setIsLoadingSubcategories(true);
            const data = await subcategoryService.getAllSubcategories(categoryId);
            setSubcategories(data.subcategories || []);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Failed to fetch subcategories'
            });
        } finally {
            setIsLoadingSubcategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
    }, []);

    useEffect(() => {
        fetchSubcategories(selectedCategoryId || null);
    }, [selectedCategoryId]);

    const clearStatus = () => {
        setStatus({ type: '', message: '' });
    };

    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(clearStatus, 5000); // Clear message after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleUpdateSuccess = async (message, updatedSubcategories = null) => {
        if (updatedSubcategories) {
            // If we have updated subcategories, use them directly
            setSubcategories(updatedSubcategories);
        } else {
            // Otherwise fetch fresh data
            await fetchSubcategories(selectedCategoryId || null);
        }
        
        setStatus({
            type: 'success',
            message: message || 'Operation completed successfully'
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleError = (message) => {
        setStatus({
            type: 'error',
            message: message || 'An error occurred'
        });
        // Ensure error message is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    if (isLoading || !admin) {
        return null;
    }

    return (
        <div className="admin-subcategories">
            <div className="admin-header">
                <h1>Subcategory Management</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setIsAddMode(!isAddMode);
                        clearStatus();
                    }}
                >
                    {isAddMode ? 'Cancel' : 'Add New Subcategory'}
                </button>
            </div>

            {status.message && (
                <Error 
                    type={status.type}
                    message={status.message}
                    onClose={clearStatus}
                />
            )}

            <div className="category-filter">
                <label htmlFor="category-filter">Filter by Category:</label>
                <select 
                    id="category-filter"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="subcategory-filter-select"
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {!isAddMode && !isLoadingSubcategories && (
                <SubcategoryStats subcategories={subcategories} />
            )}

            {isAddMode && (
                <SubcategoryForm 
                    categories={categories}
                    onSuccess={(subcategory) => {
                        setIsAddMode(false);
                        handleUpdateSuccess('Subcategory created successfully');
                    }}
                    onError={handleError}
                />
            )}

            <SubcategoryList 
                subcategories={subcategories}
                categories={categories}
                isLoading={isLoadingSubcategories}
                onUpdateSuccess={handleUpdateSuccess}
                onError={handleError}
            />

            <div className="tester-section">
                <h2>API Testing</h2>
                <p>Use this tool to test the Subcategory API functionality.</p>
                <SubcategoryTester />
            </div>
        </div>
    );
} 