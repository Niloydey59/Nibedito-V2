"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiX, FiAlertCircle } from "react-icons/fi";
import { getAllFaqs } from "@/services/faqService";
import toast from "react-hot-toast";
import FaqStats from "./FaqStats";
import FaqList from "./FaqList";
import FaqForm from "./FaqForm";

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch all FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllFaqs();

      // Sort FAQs by order
      const sortedFaqs = response.data.sort((a, b) => a.order - b.order);
      setFaqs(sortedFaqs);
    } catch (err) {
      setError("Failed to fetch FAQs: " + err.message);
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleFormSuccess = () => {
    setShowAddForm(false);
    fetchFaqs();
  };

  const handleFormError = (message) => {
    toast.error(message);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {!showAddForm && (
        <div className="mb-6 sm:mb-8">
          <FaqStats faqs={faqs} />
        </div>
      )}

      {/* Add Form Section */}
      {showAddForm && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Add New FAQ
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-white hover:text-rose-200 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <FaqForm
                faqs={faqs}
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Button (when form is not shown) */}
      {!showAddForm && (
        <div className="text-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add New FAQ</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading FAQs...</p>
        </div>
      ) : (
        /* FAQ List */
        <FaqList faqs={faqs} onFaqsUpdate={fetchFaqs} />
      )}
    </div>
  );
};

export default FaqManagement;
