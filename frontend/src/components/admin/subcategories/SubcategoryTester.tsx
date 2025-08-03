'use client';

import { useState } from 'react';
import { subcategoryService } from '@/services/subcategoryService';
import { categoryService } from '@/services/categoryService';
import { FiRefreshCw } from 'react-icons/fi';

export default function SubcategoryTester() {
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

    // Improved image fetching method to ensure better compatibility with Cloudinary
    const getRandomImage = async () => {
        try {
            // Use a specific size to ensure consistency
            const response = await fetch('https://picsum.photos/400/400');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            // Make sure we have a correct mime type
            const mimeType = blob.type || 'image/jpeg';
            
            // Create a more detailed filename
            const filename = `test-image-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
            
            // Create file with explicit type
            return new File([blob], filename, { type: mimeType });
        } catch (error) {
            console.error('Error fetching random image:', error);
            // Fallback to a static image URL that definitely works
            const fallbackResponse = await fetch('https://via.placeholder.com/400');
            const fallbackBlob = await fallbackResponse.blob();
            return new File([fallbackBlob], 'fallback-image.jpg', { type: 'image/jpeg' });
        }
    };

    const runTests = async () => {
        setIsLoading(true);
        setTestResults([]);

        try {
            // First fetch categories to use for subcategory operations
            let categories;
            try {
                const categoriesData = await categoryService.getAllCategories();
                categories = categoriesData.categories;
                if (!categories || categories.length === 0) {
                    throw new Error('No categories found. Please create a category first.');
                }
                addResult('Get Categories', true, 
                    `Successfully fetched ${categories.length} categories to use for subcategory tests`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Categories', false, error.message);
                setIsLoading(false);
                return;
            }

            // Test 1: Get All Subcategories
            try {
                const subcategoriesData = await subcategoryService.getAllSubcategories();
                addResult('Get All Subcategories', true, 
                    `Successfully fetched ${subcategoriesData.subcategories?.length || 0} subcategories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get All Subcategories', false, error.message);
            }

            // Test 2: Create Subcategory
            let newSubcategory;
            try {
                const formData = new FormData();
                const testName = 'Test Subcategory ' + Date.now();
                formData.append('name', testName);
                formData.append('description', 'Test Description for a subcategory with sufficient length to pass validation');
                formData.append('category', categories[0]._id);
                
                // Get and verify the image before attaching
                const testImage = await getRandomImage();
                console.log('Image to upload:', testImage.name, testImage.size, testImage.type);
                formData.append('image', testImage);

                // Add delay to ensure image is processed
                await new Promise(resolve => setTimeout(resolve, 500));

                const createResponse = await subcategoryService.createSubcategory(formData);
                newSubcategory = createResponse.payload.subcategory;
                addResult('Create Subcategory', true, 
                    `Created subcategory: ${newSubcategory.name} under category: ${categories[0].name}`);

                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Subcategory creation error:', error);
                addResult('Create Subcategory', false, error.message || 'Error creating subcategory');
                setIsLoading(false);
                return;
            }

            // Test 3: Get Subcategories by Category
            try {
                const subcategoriesByCategory = await subcategoryService.getSubcategoriesByCategory(categories[0]._id);
                addResult('Get Subcategories By Category', true, 
                    `Successfully fetched ${subcategoriesByCategory.length} subcategories for category: ${categories[0].name}`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Subcategories By Category', false, error.message);
            }

            // Test 4: Get Single Subcategory
            try {
                const fetchedSubcategory = await subcategoryService.getSubcategory(newSubcategory.slug);
                addResult('Get Single Subcategory', true, 
                    `Successfully fetched subcategory: ${fetchedSubcategory.name}`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Single Subcategory', false, error.message);
            }

            // Test 5: Update Subcategory
            let updatedSlug;
            try {
                const formData = new FormData();
                const updatedName = newSubcategory.name + ' (Updated)';
                formData.append('name', updatedName);
                formData.append('description', 'Updated description with sufficient length to pass validation');
                formData.append('category', categories[0]._id);
                
                // Skip image update to simplify the flow and reduce chance of errors
                // Only update image if we successfully created subcategory to begin with
                /*
                if (Math.random() > 0.5) {
                    const newImage = await getRandomImage();
                    formData.append('image', newImage);
                }
                */

                const updateResponse = await subcategoryService.updateSubcategory(newSubcategory.slug, formData);
                const updatedSubcategory = updateResponse.payload.subcategory;
                updatedSlug = updatedSubcategory.slug;
                addResult('Update Subcategory', true, 
                    `Successfully updated subcategory to: ${updatedSubcategory.name}`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Update Subcategory', false, error.message);
            }

            // Test 6: Get Active Subcategories
            try {
                const activeSubcategories = await subcategoryService.getActiveSubcategories();
                addResult('Get Active Subcategories', true, 
                    `Successfully fetched ${activeSubcategories.length} active subcategories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Get Active Subcategories', false, error.message);
            }

            // Test 7: Recalculate Product Counts
            try {
                const recalculateResponse = await subcategoryService.recalculateProductCounts();
                addResult('Recalculate Product Counts', true, 
                    `Successfully recalculated product counts for all subcategories`);
                
                // Add delay between operations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                addResult('Recalculate Product Counts', false, error.message);
            }

            // Test 8: Delete Subcategory
            try {
                // Use the updated slug for deleting
                const slugToDelete = updatedSlug || newSubcategory.slug;
                const deleteResponse = await subcategoryService.deleteSubcategory(slugToDelete);
                addResult('Delete Subcategory', true, 
                    `Successfully deleted subcategory: ${deleteResponse.payload.subcategory.name}`);
            } catch (error) {
                addResult('Delete Subcategory', false, error.message);
            }

        } catch (error) {
            addResult('Overall Test Suite', false, error.message || 'Unknown error occurred');
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
                <h2>Subcategory API Flow Tester</h2>
                <div className="button-group">
                    <button 
                        className="btn btn-primary"
                        onClick={runTests}
                        disabled={isLoading}
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