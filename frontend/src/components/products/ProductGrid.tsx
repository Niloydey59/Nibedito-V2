"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
  FiStar,
  FiHeart,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";

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
  const [hoveredProduct, setHoveredProduct] = useState(null);

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
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
    <div className="space-y-8">
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
            className={`group relative bg-surface border border-border rounded-xl overflow-hidden 
                        shadow-md hover:shadow-xl transition-all duration-300 
                        hover:-translate-y-2 hover:scale-105 
                        ${
                          viewMode === "list"
                            ? "flex flex-row h-48 md:h-40"
                            : "flex flex-col h-full"
                        }`}
            onMouseEnter={() => setHoveredProduct(product._id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <Link
              href={`/products/${product.slug}`}
              className={`block flex-1 ${
                viewMode === "list"
                  ? "flex flex-row h-full"
                  : "flex flex-col h-full"
              }`}
            >
              {/* Product Image */}
              <div
                className={`relative bg-surface-elevated overflow-hidden flex-shrink-0 ${
                  viewMode === "list"
                    ? "w-32 sm:w-40 md:w-48 h-full"
                    : "aspect-square w-full"
                }`}
              >
                <Image
                  src={product.thumbnailImage || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay Actions for Grid View */}
                {viewMode === "grid" && (
                  <div
                    className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-300 ${
                      hoveredProduct === product._id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <button className="btn-icon bg-white/90 hover:bg-white text-gray-800 shadow-md">
                      <FiHeart size={16} />
                    </button>
                  </div>
                )}

                {/* Stock Status */}
                {product.variants &&
                  product.variants.length > 0 &&
                  product.variants[0].quantity === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div
                className={`p-4 flex flex-col flex-1 ${
                  viewMode === "list"
                    ? "justify-between min-h-0 min-w-0"
                    : "h-full"
                }`}
              >
                {/* Top Section - Title and Description */}
                <div className="flex-1 min-h-0">
                  <h3
                    className={`font-semibold text-foreground group-hover:text-primary transition-colors ${
                      viewMode === "list"
                        ? "text-base md:text-lg mb-2 line-clamp-2"
                        : "text-base mb-2 line-clamp-2"
                    }`}
                    style={{
                      minHeight: viewMode === "list" ? "2.5rem" : "2.5rem",
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Description for both views */}
                  <p
                    className={`text-sm text-text-secondary mb-3 ${
                      viewMode === "list" ? "line-clamp-2" : "line-clamp-2"
                    }`}
                    style={{
                      minHeight: viewMode === "list" ? "2.5rem" : "2.5rem",
                    }}
                  >
                    {product.description || "No description available."}
                  </p>

                  {/* Rating */}
                  {product.averageRating && (
                    <div
                      className="flex items-center gap-1 mb-2"
                      style={{ minHeight: "1rem" }}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary ml-1">
                        ({product.averageRating.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Section - Price and Action Button */}
                <div
                  className={`flex items-center justify-between mt-auto pt-2 ${
                    viewMode === "list" ? "flex-wrap gap-2" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-primary ${
                          viewMode === "list" ? "text-lg" : "text-lg"
                        }`}
                      >
                        ৳{product.price}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="text-xs text-text-secondary line-through">
                            ৳{product.originalPrice}
                          </span>
                        )}
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={
                        addingToCart[product._id] ||
                        (product.variants &&
                          product.variants[0]?.quantity === 0)
                      }
                      className="btn-icon btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
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

            {/* List View Add to Cart */}
            {viewMode === "list" && (
              <div className="p-4 flex flex-col items-center justify-center flex-shrink-0 min-w-0">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={
                    addingToCart[product._id] ||
                    (product.variants && product.variants[0]?.quantity === 0)
                  }
                  className="btn btn-primary btn-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {addingToCart[product._id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FiShoppingCart size={16} className="mr-2" />
                  )}
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </button>

                {/* Heart icon for list view */}
                <button className="mt-2 p-2 rounded-lg hover:bg-surface-elevated transition-colors">
                  <FiHeart
                    size={16}
                    className="text-text-secondary hover:text-primary"
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modern Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="text-sm text-text-secondary">
            Showing {(pagination.currentPage - 1) * 12 + 1} to{" "}
            {Math.min(pagination.currentPage * 12, pagination.totalProducts)} of{" "}
            {pagination.totalProducts} products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              <FiChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let page;
                  if (pagination.totalPages <= 5) {
                    page = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    page = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    page = pagination.totalPages - 4 + i;
                  } else {
                    page = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${
                        page === pagination.currentPage
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-surface-elevated text-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              Next
              <FiChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
