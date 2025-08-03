// frontend/src/components/admin/categories/CategoryTester.js
'use client';

import { useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { FiRefreshCw } from 'react-icons/fi';

export default function CategoryTester() {
    const [testResults, setTestResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const addResult = (operation, success, message) => {
        setTestResults(prev => [{
            operation,
            success,
            message,
            timestamp: new Date().toISOString()
        }, ...prev]);
    };

    const runTests = async () => {
        setIsLoading(true);
        setTestResults([]);

        try {
            // Test 1: Get All Categories
            try {
                const categoriesData = await categoryService.getAllCategories();
                addResult('Get All Categories', true, 
                    `Successfully fetched ${categoriesData.categories.length} categories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get All Categories', false, error.message);
            }

            // Test 2: Create Category
            let newCategory;
            try {
                const formData = new FormData();
                const testName = 'Test Category ' + Date.now();
                formData.append('name', testName);
                formData.append('description', 'Test Description');
                
                const blob = await fetch('https://picsum.photos/200').then(r => r.blob());
                const testImage = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
                formData.append('image', testImage);

                const createResponse = await categoryService.createCategory(formData);
                newCategory = createResponse.payload.category;
                addResult('Create Category', true, 
                    `Created category: ${newCategory.name}`);

                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Create Category', false, error.message);
                setIsLoading(false);
                return;
            }

            // Test 3: Get Active Categories
            try {
                const activeCategories = await categoryService.getActiveCategories();
                addResult('Get Active Categories', true, 
                    `Successfully fetched ${activeCategories.length} active categories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Active Categories', false, error.message);
            }

            // Test 4: Get Single Category
            try {
                const fetchedCategory = await categoryService.getCategory(newCategory.slug);
                addResult('Get Single Category', true, 
                    `Successfully fetched category: ${fetchedCategory.name}`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Single Category', false, error.message);
            }

            // Test 5: Update Category
            let updatedSlug;
            try {
                const formData = new FormData();
                const updatedName = newCategory.name + ' (Updated)';
                formData.append('name', updatedName);
                formData.append('description', 'Updated Description');

                const updateResponse = await categoryService.updateCategory(
                    newCategory.slug,
                    formData
                );
                const updatedCategory = updateResponse.payload.category;
                updatedSlug = updatedCategory.slug; // Store the new slug
                addResult('Update Category', true, 
                    `Updated category: ${updatedCategory.name}`);

                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Update Category', false, error.message);
                return;
            }

            // Test 6: Recalculate Product Counts
            try {
                const recalculateResponse = await categoryService.recalculateProductCounts();
                addResult('Recalculate Product Counts', true, 
                    `Successfully recalculated product counts for all categories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Recalculate Product Counts', false, error.message);
            }

            // Test 7: Delete Category
            if (updatedSlug) { // Use the updated slug
                try {
                    const deleteResponse = await categoryService.deleteCategory(updatedSlug);
                    addResult('Delete Category', true, 
                        `Deleted category: ${deleteResponse.payload.category.name}`);
                } catch (error) {
                    addResult('Delete Category', false, error.message);
                }
            }

        } catch (error) {
            addResult('Test Suite', false, 'Test suite failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className="api-tester collapsed">
                <div className="tester-header">
                    <h3>API Tester</h3>
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsExpanded(true)}
                    >
                        Expand
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="api-tester">
            <div className="tester-header">
                <h2>Category API Flow Tester</h2>
                <div className="button-group">
                    <button 
                        onClick={runTests} 
                        disabled={isLoading}
                        className="btn btn-primary"
                    >
                        <FiRefreshCw className={isLoading ? 'spin' : ''} />
                        {isLoading ? 'Running Tests...' : 'Run Test Flow'}
                    </button>
                    <button 
                        className="btn btn-sm"
                        onClick={() => setIsExpanded(false)}
                    >
                        Collapse
                    </button>
                </div>
            </div>

            <div className="test-results">
                {testResults.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <p>No tests run yet. Click "Run Test Flow" to start the test suite.</p>
                    </div>
                )}
                
                {testResults.map((result, index) => (
                    <div 
                        key={index} 
                        className={`result-card ${result.success ? 'success' : 'error'}`}
                    >
                        <div className="result-header">
                            <span className="test-name">{result.operation}</span>
                            <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>
                        </div>
                        {!result.success && (
                            <div className="error-message">{result.message}</div>
                        )}
                        {result.success && (
                            <div className="result-message">{result.message}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}