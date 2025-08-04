"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilter";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState(
    searchParams.get("view") === "list" ? "list" : "grid"
  );
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    category: "",
    subcategory: "",
    inStock: undefined,
    sort: "newest",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);

      // Map sort value to sortField and sortOrder
      let sortField = "createdAt";
      let sortOrder = "desc";

      if (filters.sort) {
        switch (filters.sort) {
          case "newest":
            sortField = "createdAt";
            sortOrder = "desc";
            break;
          case "price-high":
            sortField = "price";
            sortOrder = "desc";
            break;
          case "price-low":
            sortField = "price";
            sortOrder = "asc";
            break;
          case "name-asc":
            sortField = "name";
            sortOrder = "asc";
            break;
          case "name-desc":
            sortField = "name";
            sortOrder = "desc";
            break;
          default:
            sortField = "createdAt";
            sortOrder = "desc";
        }
      }

      console.log("Fetching products with filters:", {
        // Debug log
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        category: filters.category,
        subcategory: filters.subcategory,
        inStock: filters.inStock,
      });

      const response = await productService.getAllProducts({
        page,
        limit: viewMode === "list" ? 15 : 12,
        search: searchParams.get("search") || "",
        category: filters.category || "",
        subcategory: filters.subcategory || "",
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        inStock: filters.inStock,
        sortField,
        sortOrder,
      });

      setProducts(response.payload.products);
      setPagination({
        currentPage: response.payload.pagination.currentPage,
        totalPages: response.payload.pagination.totalPages,
        totalProducts: response.payload.pagination.totalProducts,
        hasNextPage: response.payload.pagination.hasNextPage,
        hasPrevPage: response.payload.pagination.hasPrevPage,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [searchParams, filters, viewMode]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        console.log("Fetched categories:", activeCategories);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Add window resize listener for responsive behavior
  useEffect(() => {
    // Initialize filter visibility and check if mobile
    const checkMobile = () => window.innerWidth <= 768;
    setIsMobile(checkMobile());
    setIsFilterVisible(window.innerWidth > 768);

    const handleResize = () => {
      // Update mobile state
      setIsMobile(checkMobile());

      // Hide filters by default on mobile screens
      if (window.innerWidth <= 768) {
        setIsFilterVisible(false);

        // Force grid view on mobile
        if (viewMode === "list") {
          setViewMode("grid");
          // Update URL without triggering a navigation
          const params = new URLSearchParams(searchParams.toString());
          params.set("view", "grid");
          window.history.replaceState({}, "", `?${params.toString()}`);
        }
      }
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [searchParams, viewMode]);

  const handleFilterChange = (newFilters) => {
    console.log("Filter change received:", newFilters); // Debug log

    // Ensure empty strings are handled properly for price filters
    const processedFilters = {
      ...newFilters,
      minPrice: newFilters.minPrice === "" ? undefined : newFilters.minPrice,
      maxPrice: newFilters.maxPrice === "" ? undefined : newFilters.maxPrice,
    };

    setFilters((prev) => {
      const updatedFilters = { ...prev, ...processedFilters };
      console.log("Updated filters:", updatedFilters); // Debug log
      return updatedFilters;
    });
  };

  const handlePageChange = (newPage) => {
    setIsLoading(true);
    fetchProducts(newPage);
  };

  // Function to clear search and show all products
  const clearSearch = () => {
    // Clear the URL parameter
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);

    // Dispatch a custom event to clear the navbar search input
    if (typeof window !== "undefined") {
      const clearSearchEvent = new CustomEvent("clear-navbar-search");
      window.dispatchEvent(clearSearchEvent);
    }
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      category: "",
      subcategory: "",
      inStock: undefined,
      sort: "newest",
    });
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    // Prevent switching to list view on mobile
    if (isMobile && mode === "list") {
      return;
    }

    setViewMode(mode);

    // Update URL to persist view mode
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-elevated border border-border rounded-2xl p-6 lg:p-8 mb-8 shadow-sm">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <svg
              className="absolute right-0 top-0 h-full w-1/3"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon
                fill="currentColor"
                points="50,0 100,0 100,100"
                opacity="0.1"
              />
            </svg>
          </div>

          <div className="relative">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                      Discover Products
                    </h1>
                    <p className="text-text-secondary">
                      Find exactly what you're looking for
                    </p>
                  </div>
                </div>

                {/* Search Results Info */}
                {searchParams.get("search") && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                      <FiSearch className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        "{searchParams.get("search")}"
                      </span>
                      <button
                        onClick={clearSearch}
                        className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors"
                      >
                        <FiX className="w-3 h-3 text-primary" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Count */}
                {pagination.totalProducts > 0 && (
                  <div className="inline-flex items-center gap-2 bg-surface-elevated border border-border rounded-lg px-4 py-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {pagination.totalProducts} product
                      {pagination.totalProducts !== 1 ? "s" : ""} found
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-surface-elevated border border-border rounded-lg p-1 shadow-sm">
                  <button
                    className={`p-2.5 rounded-md transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-background text-text-secondary"
                    }`}
                    onClick={() => handleViewModeChange("grid")}
                    aria-label="Grid view"
                  >
                    <FiGrid size={18} />
                  </button>
                  {!isMobile && (
                    <button
                      className={`p-2.5 rounded-md transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-primary text-white shadow-sm"
                          : "hover:bg-background text-text-secondary"
                      }`}
                      onClick={() => handleViewModeChange("list")}
                      aria-label="List view"
                    >
                      <FiList size={18} />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  className="btn btn-primary gap-2 shadow-sm hover:shadow-md"
                >
                  <FiFilter size={16} />
                  <span className="hidden sm:inline">
                    {isFilterVisible ? "Hide" : "Show"} Filters
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`grid gap-8 transition-all duration-300 ${
            isFilterVisible ? "lg:grid-cols-[320px_1fr]" : "grid-cols-1"
          }`}
          style={{ height: "calc(100vh - 200px)" }}
        >
          {/* Filters Sidebar */}
          {isFilterVisible && (
            <aside className="lg:sticky lg:top-0 h-full">
              <div className="h-full overflow-y-auto scrollbar-thin">
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  onHideFilters={() => setIsFilterVisible(false)}
                />
              </div>
            </aside>
          )}

          {/* Products Content */}
          <section className="h-full overflow-y-auto scrollbar-thin">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              viewMode={viewMode}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
