"use client";

import { useState } from "react";
import Image from "next/image";
import { FiUpload, FiX, FiImage, FiSave, FiEdit3 } from "react-icons/fi";
import { categoryService } from "@/services/categoryService";

export default function CategoryForm({
  category,
  onSuccess,
  onError,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(category?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setPreviewImage("");
    setImage(null);
    // Reset file input
    const fileInput = document.getElementById("image");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (image) {
        formDataToSend.append("image", image);
      }

      let response;
      if (category) {
        response = await categoryService.updateCategory(
          category.slug,
          formDataToSend
        );
      } else {
        response = await categoryService.createCategory(formDataToSend);
      }

      if (response.payload?.category) {
        onSuccess(response.payload.category);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
          {category ? (
            <FiEdit3 className="w-5 h-5 text-white" />
          ) : (
            <FiSave className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {category ? "Edit Category" : "Create New Category"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {category
              ? "Update category information"
              : "Fill in the details to create a new category"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter category name"
              disabled={isSubmitting}
            />
          </div>

          {/* Status Badge (for editing) */}
          {category && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Status
              </label>
              <div className="flex items-center h-10">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    category.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200 resize-vertical"
            placeholder="Enter category description"
            disabled={isSubmitting}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category Image
          </label>

          {/* Current Image Preview */}
          {previewImage && (
            <div className="relative inline-block">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <Image
                  src={previewImage}
                  alt="Category preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                  disabled={isSubmitting}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
              dragActive
                ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
            } ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <input
              type="file"
              id="image"
              onChange={handleFileInput}
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />

            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiImage className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {dragActive
                  ? "Drop image here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 transition-all duration-200 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {category ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {category ? (
                  <>
                    <FiEdit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Update Category
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Create Category
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
