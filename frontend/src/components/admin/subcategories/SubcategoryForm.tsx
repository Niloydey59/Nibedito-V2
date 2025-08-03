'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiUpload, FiX } from 'react-icons/fi';
import { subcategoryService } from '@/services/subcategoryService';

export default function SubcategoryForm({ subcategory, categories, onSuccess, onError, onCancel }) {
    const [formData, setFormData] = useState({
        name: subcategory?.name || '',
        description: subcategory?.description || '',
        category: subcategory?.category?._id || subcategory?.category || '',
    });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(subcategory?.image || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Parent category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImage(null);
        setPreviewImage('');
        // Reset file input
        const fileInput = document.getElementById('subcategory-image');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            
            if (image) {
                formDataToSend.append('image', image);
            }

            let response;
            if (subcategory) {
                response = await subcategoryService.updateSubcategory(subcategory.slug, formDataToSend);
            } else {
                response = await subcategoryService.createSubcategory(formDataToSend);
            }

            if (response.payload?.subcategory) {
                onSuccess(response.payload.subcategory);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            onError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="subcategory-form-container">
            <h2>{subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
            <form onSubmit={handleSubmit} className="subcategory-form">
                <div className="form-group">
                    <label htmlFor="category">Parent Category *</label>
                    <select 
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={errors.category ? 'error-input' : ''}
                        disabled={isSubmitting}
                        required
                        style={{
                            backgroundColor: 'var(--surface-color)',
                            color: 'var(--text-color)',
                        }}
                    >
                        <option value="">Select a category</option>
                        {categories?.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.category && <p className="error-text">{errors.category}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="name">Subcategory Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error-input' : ''}
                        disabled={isSubmitting}
                        required
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label>Image</label>
                    <div className="subcategory-image-upload">
                        {previewImage && (
                            <div className="image-preview-container">
                                <div className="image-preview">
                                    <Image 
                                        src={previewImage} 
                                        alt="Preview" 
                                        width={200} 
                                        height={200}
                                        className="preview-image"
                                    />
                                    <button 
                                        type="button" 
                                        className="remove-image-btn"
                                        onClick={clearImage}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!previewImage && (
                            <div className="upload-container">
                                <label htmlFor="subcategory-image" className="upload-label">
                                    <FiUpload className="upload-icon" />
                                    <span>Upload Image</span>
                                </label>
                                <input
                                    type="file"
                                    id="subcategory-image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={isSubmitting}
                                    className="file-input"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting 
                            ? (subcategory ? 'Updating...' : 'Creating...') 
                            : (subcategory ? 'Update Subcategory' : 'Create Subcategory')}
                    </button>
                </div>
            </form>
        </div>
    );
} 