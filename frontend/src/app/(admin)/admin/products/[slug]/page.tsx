'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { subcategoryService } from '@/services/subcategoryService';
import ImageManager from '@/components/admin/products/ImageManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Error from '@/components/common/Error';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import MarkdownEditor from '@/components/admin/common/MarkdownEditor';

export default function ProductDetailsPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        shipping: false,
        variants: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, categoriesData] = await Promise.all([
                    productService.getProduct(slug),
                    categoryService.getAllCategories()
                ]);
                
                setProduct(productData);
                setCategories(categoriesData.categories);
                
                // Load subcategories if product has a category
                if (productData.category?._id) {
                    try {
                        setIsLoadingSubcategories(true);
                        const subcats = await subcategoryService.getSubcategoriesByCategory(productData.category._id);
                        setSubcategories(subcats || []);
                    } catch (error) {
                        console.error('Failed to fetch subcategories:', error);
                    } finally {
                        setIsLoadingSubcategories(false);
                    }
                }
                
                setFormData({
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    category: productData.category._id,
                    subcategory: productData.subcategory?._id || '',
                    shipping: productData.shipping,
                    variants: productData.variants
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    // Update subcategories when category changes
    useEffect(() => {
        if (formData.category) {
            const fetchSubcategories = async () => {
                try {
                    setIsLoadingSubcategories(true);
                    const subcats = await subcategoryService.getSubcategoriesByCategory(formData.category);
                    setSubcategories(subcats || []);
                    
                    // If current subcategory doesn't belong to this category, reset it
                    if (formData.subcategory) {
                        const subcatBelongsToCategory = subcats.some(
                            subcat => subcat._id === formData.subcategory
                        );
                        
                        if (!subcatBelongsToCategory) {
                            setFormData(prev => ({ ...prev, subcategory: '' }));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch subcategories:', error);
                    setSubcategories([]);
                } finally {
                    setIsLoadingSubcategories(false);
                }
            };

            fetchSubcategories();
        } else {
            setSubcategories([]);
            // Reset subcategory if category is cleared
            if (formData.subcategory) {
                setFormData(prev => ({ ...prev, subcategory: '' }));
            }
        }
    }, [formData.category]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({
            ...prev,
            description: value
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            [field]: value
        };
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: '', size: '', quantity: 0, images: [] }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleThumbnailChange = async (file) => {
        try {
            const formDataToSend = new FormData();
            // Include all required fields from current formData
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            if (formData.subcategory) {
                formDataToSend.append('subcategory', formData.subcategory);
            }
            formDataToSend.append('shipping', formData.shipping);
            
            // Keep existing variants
            formDataToSend.append('variants', JSON.stringify(formData.variants));
            
            // Add the new thumbnail
            formDataToSend.append('thumbnail', file);
            
            const response = await productService.updateProduct(slug, formDataToSend);
            setProduct(response.payload.product);
            // Don't redirect, just update the state
            setFormData(prev => ({
                ...prev,
                thumbnailImage: response.payload.product.thumbnailImage
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVariantImagesChange = async (variantIndex, files, removedIndices = []) => {
        try {
            const formDataToSend = new FormData();
            // Include all required fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            if (formData.subcategory) {
                formDataToSend.append('subcategory', formData.subcategory);
            }
            formDataToSend.append('shipping', formData.shipping);

            // Prepare variants with the new images
            const updatedVariants = [...formData.variants];
            
            // Add new files to formData if any
            files.forEach(file => {
                formDataToSend.append('variantImages', file);
            });

            // Create an update object for this variant
            const variantUpdate = {
                ...updatedVariants[variantIndex],
                removedImageIndices: removedIndices,
                newImageCount: files.length
            };

            // Keep other variants unchanged
            const variantsToUpdate = updatedVariants.map((v, idx) => 
                idx === variantIndex ? variantUpdate : v
            );

            formDataToSend.append('variants', JSON.stringify(variantsToUpdate));

            const response = await productService.updateProduct(slug, formDataToSend);
            setProduct(response.payload.product);
            setFormData(prev => ({
                ...prev,
                variants: response.payload.product.variants
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            
            // Include all required fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            if (formData.subcategory) {
                formDataToSend.append('subcategory', formData.subcategory);
            }
            formDataToSend.append('shipping', formData.shipping);
            formDataToSend.append('variants', JSON.stringify(formData.variants));

            const response = await productService.updateProduct(slug, formDataToSend);
            setProduct(response.payload.product);
            router.push('/admin/products');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await productService.deleteProduct(slug);
            router.push('/admin/products');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Error message={error} />;
    if (!product) return <Error message="Product not found" />;

    return (
        <div className="product-details-admin">
            <div className="admin-header">
                <h1>{product.name}</h1>
                <div className="header-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => router.push('/admin/products')}
                    >
                        Back to Products
                    </button>
                    <button 
                        className="btn btn-danger"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isSubmitting}
                    >
                        <FiTrash2 /> Delete Product
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="name">Product Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <MarkdownEditor
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            height={300}
                        />
                    </div>

                    <div className="admin-product-form-row">
                        <div className="form-group">
                            <label htmlFor="price">Price</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="subcategory">Subcategory</label>
                        <div className="subcategory-select-container">
                            <select
                                id="subcategory"
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleInputChange}
                                disabled={!formData.category || isLoadingSubcategories}
                            >
                                <option value="">Select Subcategory (Optional)</option>
                                {subcategories.map(subcategory => (
                                    <option key={subcategory._id} value={subcategory._id}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                            {isLoadingSubcategories && (
                                <div className="subcategory-loading">
                                    <LoadingSpinner size="small" fullPage={false} />
                                </div>
                            )}
                        </div>
                        {!formData.category && (
                            <p className="helper-text">Please select a category first</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="shipping"
                                checked={formData.shipping}
                                onChange={handleInputChange}
                            />
                            Available for Shipping
                        </label>
                    </div>
                </div>

                <div className="image-management-section">
                    <ImageManager
                        title="Thumbnail Image"
                        currentImage={product.thumbnailImage}
                        onImageChange={handleThumbnailChange}
                        onImageRemove={() => {}}
                    />
                </div>

                <div className="variants-section">
                    <div className="section-header">
                        <h3>Product Variants</h3>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="btn btn-secondary"
                        >
                            <FiPlus /> Add Variant
                        </button>
                    </div>

                    {formData.variants.map((variant, index) => (
                        <div key={index} className="variant-item">
                            <div className="variant-header">
                                <h4>Variant #{index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="btn btn-icon btn-danger"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>

                            <div className="variant-form">
                                <div className="admin-product-form-row">
                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="text"
                                            value={variant.color}
                                            onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Size</label>
                                        <input
                                            type="text"
                                            value={variant.size}
                                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(index, 'quantity', parseInt(e.target.value))}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <ImageManager
                                    title={`Variant Images`}
                                    currentImage={variant.images}
                                    onImageChange={(files, removedIndices) => handleVariantImagesChange(index, files, removedIndices)}
                                    multiple={true}
                                    maxImages={5}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Product"
                message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </div>
    );
}
