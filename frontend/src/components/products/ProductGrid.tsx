"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";

// Function to generate pagination numbers with ellipsis
const generatePaginationNumbers = (currentPage, totalPages) => {
  // For small number of pages, show all page numbers
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show first page
  pages.push(1);

  // Show dots if there's a gap
  if (currentPage > 3) {
    pages.push("...");
  }

  // Calculate start and end of middle section
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  // Ensure at least 3 middle numbers when possible
  if (currentPage <= 3) {
    end = Math.min(totalPages - 1, 4);
  } else if (currentPage >= totalPages - 2) {
    start = Math.max(2, totalPages - 3);
  }

  // Add middle numbers
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Show dots if there's a gap before last page
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

export default function ProductGrid({
  products,
  isLoading,
  error,
  pagination,
  onPageChange,
  viewMode = "grid",
}) {
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});
  // Keep track of previous products for smoother transitions
  const [prevHeight, setPrevHeight] = useState(0);
  const [prevViewMode, setPrevViewMode] = useState(viewMode);
  const [fadeTransition, setFadeTransition] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!isLoading && gridRef.current) {
      setPrevHeight(gridRef.current.offsetHeight);
    }
  }, [products, isLoading]);

  // Handle view mode transitions
  useEffect(() => {
    if (prevViewMode !== viewMode) {
      setFadeTransition(true);

      // After animation completes, reset fade state
      const timer = setTimeout(() => {
        setFadeTransition(false);
        setPrevViewMode(viewMode);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [viewMode, prevViewMode]);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.variants || product.variants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }

    const productId = product._id;
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      const success = await addToCart(productId, 1, product.variants[0]._id);
      if (success) {
        toast.success("Added to cart successfully!");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 max-w-md mx-auto transition-colors duration-normal">
          <h3 className="text-lg font-semibold text-danger mb-2">
            Error Loading Products
          </h3>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-surface border border-border rounded-lg p-8 max-w-md mx-auto transition-colors duration-normal">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Products Found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid/List */}
      <div
        className={`grid gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className={`group bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${
              viewMode === "list" ? "flex flex-row h-32" : "flex flex-col"
            }`}
          >
            <Link href={`/products/${product.slug}`} className="block flex-1">
              {/* Product Image */}
              <div
                className={`relative bg-surface-elevated ${
                  viewMode === "list"
                    ? "w-32 h-full flex-shrink-0"
                    : "aspect-square w-full"
                }`}
              >
                <Image
                  src={product.thumbnailImage || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.variants &&
                  product.variants.length > 0 &&
                  product.variants[0].quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-danger px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
              </div>

              {/* Product Info */}
              <div
                className={`p-4 flex-1 flex flex-col ${
                  viewMode === "list" ? "justify-between" : ""
                }`}
              >
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-foreground group-hover:text-primary transition-colors ${
                      viewMode === "list" ? "text-sm mb-1" : "text-base mb-2"
                    }`}
                  >
                    {product.name}
                  </h3>

                  {viewMode === "grid" && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {product.description || "No description available."}
                    </p>
                  )}
                </div>

                {/* Product Footer */}
                <div
                  className={`flex items-center justify-between ${
                    viewMode === "list" ? "mt-1" : "mt-auto"
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-primary ${
                        viewMode === "list" ? "text-sm" : "text-lg"
                      }`}
                    >
                      ৳{product.price}
                    </span>
                    {product.averageRating && (
                      <div className="flex items-center gap-1 mt-1">
                        <FiStar
                          className="text-yellow-500 fill-current"
                          size={14}
                        />
                        <span className="text-xs text-text-secondary">
                          {product.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {viewMode === "grid" && (
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={
                        addingToCart[product._id] ||
                        (product.variants &&
                          product.variants[0]?.quantity === 0)
                      }
                      className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {addingToCart[product._id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiShoppingCart size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-2">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            <FiChevronLeft size={16} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={typeof page !== "number"}
                className={`w-10 h-10 flex items-center justify-center text-sm rounded-md transition-colors ${
                  page === pagination.currentPage
                    ? "bg-primary text-white"
                    : typeof page === "number"
                    ? "hover:bg-surface-elevated text-foreground"
                    : "text-text-secondary cursor-default"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
