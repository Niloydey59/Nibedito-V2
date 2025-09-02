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
import type { Product, Category, Pagination } from "@/types";

interface FilterState {
  minPrice: string;
  maxPrice: string;
  category: string;
  subcategory: string;
  inStock?: boolean;
  sort: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    searchParams.get("view") === "list" ? "list" : "grid"
  );
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    category: "",
    subcategory: "",
    inStock: undefined,
    sort: "newest",
  });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const fetchProducts = async (page: number = 1): Promise<void> => {
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

      setProducts(response.payload!.products);
      // Update pagination structure to match new type
      setPagination(response.payload!.pagination);
    } catch (err: any) {
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

  const handleFilterChange = (newFilters: FilterState): void => {
    console.log("Filter change received:", newFilters); // Debug log

    // Ensure empty strings are handled properly for price filters
    const processedFilters = {
      ...newFilters,
      minPrice: newFilters.minPrice === "" ? "" : newFilters.minPrice,
      maxPrice: newFilters.maxPrice === "" ? "" : newFilters.maxPrice,
    };

    setFilters((prev) => {
      const updatedFilters = { ...prev, ...processedFilters };
      console.log("Updated filters:", updatedFilters); // Debug log
      return updatedFilters;
    });
  };

  const handlePageChange = (newPage: number): void => {
    setIsLoading(true);
    fetchProducts(newPage);
  };

  // Function to clear search and show all products
  const clearSearch = (): void => {
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
  const resetFilters = (): void => {
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
  const handleViewModeChange = (mode: "grid" | "list"): void => {
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
        <div className="product-header-gradient-enhanced relative overflow-hidden border border-border rounded-2xl mb-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600/40 via-rose-400/30 to-rose-200/20 dark:from-primary/20 dark:to-accent/20" />
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

          <div className="relative z-10">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 lg:p-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-300/80 to-rose-500/70 dark:from-blue-600/40 dark:to-indigo-500/30 rounded-xl blur-sm animate-pulse" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-white/90 to-rose-100/80 dark:from-primary dark:to-accent backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-rose-300/60 dark:border-blue-700/30">
                      <FiTrendingUp className="w-6 h-6 text-rose-700 dark:text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white dark:text-foreground drop-shadow-md tracking-tight">
                      <span className="bg-gradient-to-r from-white via-rose-100 to-white dark:from-slate-200 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                        Discover Products
                      </span>
                    </h1>
                    <p className="text-rose-50 dark:text-text-secondary font-medium drop-shadow-sm">
                      Find exactly what you&apos;re looking for
                    </p>
                  </div>
                </div>

                {/* Search Results Info */}
                {searchParams.get("search") && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-white/20 dark:bg-primary/10 border border-rose-200/60 dark:border-primary/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <FiSearch className="w-4 h-4 text-white dark:text-primary" />
                      <span className="text-sm text-white dark:text-primary font-medium">
                        &ldquo;{searchParams.get("search")}&rdquo;
                      </span>
                      <button
                        onClick={clearSearch}
                        className="ml-1 p-0.5 hover:bg-white/30 dark:hover:bg-primary/20 rounded transition-colors"
                      >
                        <FiX className="w-3 h-3 text-white dark:text-primary" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Count */}
                {pagination.total > 0 && (
                  <div className="inline-flex items-center gap-2 bg-white/30 dark:bg-surface-elevated border border-rose-200/50 dark:border-border rounded-lg px-4 py-2 backdrop-blur-sm shadow-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white dark:text-foreground drop-shadow-sm">
                      {pagination.total} product
                      {pagination.total !== 1 ? "s" : ""} found
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

          {/* Enhanced Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600/80 via-rose-400/70 via-rose-300/60 to-rose-200/50 dark:from-blue-600/40 dark:via-indigo-600/30 dark:via-purple-600/25 dark:to-rose-600/15 z-10" />
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
          <section className="h-full overflow-y-auto scrollbar-none">
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
