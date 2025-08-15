"use client";

import { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPackage,
  FiTag,
  FiCalendar,
  FiMoreVertical,
} from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";

interface SubcategoryListProps {
  subcategories: any[];
  categories: any[];
  isLoading: boolean;
  onUpdateSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function SubcategoryList({
  subcategories,
  categories,
  isLoading,
  onUpdateSuccess,
  onError,
}: SubcategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleEdit = (subcategory) => {
    setEditingId(subcategory._id);
    setEditForm({
      name: subcategory.name,
      description: subcategory.description || "",
      categoryId: subcategory.category._id || subcategory.category || "",
    });
  };

  const handleDelete = (subcategoryId) => {
    // Implement delete functionality
  };

  const handleSaveEdit = async () => {
    // Implement save edit functionality
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                  <div>
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-600 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subcategories.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <FiPackage className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No subcategories found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Get started by creating your first subcategory to organize your
            products better.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Subcategories ({subcategories.length})
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your product subcategories
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {subcategories.map((subcategory) => (
          <div
            key={subcategory._id}
            className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {editingId === subcategory._id ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={editForm.categoryId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-vertical"
                    placeholder="Enter description..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <FiTag className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                        {subcategory.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                        {getCategoryName(subcategory.categoryId)}
                      </span>
                    </div>
                    {subcategory.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                        {subcategory.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>
                          Created{" "}
                          {new Date(subcategory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiPackage className="w-3 h-3" />
                        <span>ID: {subcategory._id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="hidden sm:flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(subcategory._id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Mobile Actions Menu */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(
                          actionMenuOpen === subcategory._id
                            ? null
                            : subcategory._id
                        )
                      }
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5" />
                    </button>
                    {actionMenuOpen === subcategory._id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                        <button
                          onClick={() => {
                            handleEdit(subcategory);
                            setActionMenuOpen(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(subcategory._id);
                            setActionMenuOpen(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
