"use client";

import { useState } from "react";
import { FiPlus, FiLoader } from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";

interface SubcategoryFormProps {
  categories: any[];
  onSuccess: (subcategory: any) => void;
  onError: (message: string) => void;
  subcategory?: any; // Optional prop for editing
}

export default function SubcategoryForm({
  categories,
  onSuccess,
  onError,
  subcategory,
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState({
    name: subcategory?.name || "",
    description: subcategory?.description || "",
    categoryId: subcategory?.categoryId || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Parent category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.categoryId);

      let response;
      if (subcategory) {
        response = await subcategoryService.updateSubcategory(
          subcategory.slug,
          formDataToSend
        );
      } else {
        response = await subcategoryService.createSubcategory(formDataToSend);
      }

      if (response.payload?.subcategory) {
        onSuccess(response.payload.subcategory);
        if (!subcategory) {
          handleReset(); // Only reset if creating new subcategory
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Subcategory Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter subcategory name"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Category Field */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Parent Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter subcategory description (optional)"
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-vertical"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide a brief description to help users understand this subcategory
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <FiPlus className="w-5 h-5" />
              <span>Create Subcategory</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Form
        </button>
      </div>

      {/* Form Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Guidelines for Creating Subcategories
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Choose a clear and descriptive name</li>
          <li>• Select the appropriate parent category</li>
          <li>• Add a description to help users understand the subcategory</li>
          <li>• Ensure the name is unique within the selected category</li>
        </ul>
      </div>
    </form>
  );
}
