"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiGrid, FiList, FiFilter, FiX, FiRefreshCw } from "react-icons/fi";
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
    sortField: "createdAt",
    sortOrder: "desc",
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

      const response = await productService.getAllProducts({
        page,
        limit: viewMode === "list" ? 15 : 12,
        search: searchParams.get("search") || "",
        category: filters.category || "",
        subcategory: filters.subcategory || "",
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
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
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
      sortField: "createdAt",
      sortOrder: "desc",
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
    <main className="min-h-screen bg-background text-foreground py-8 px-4 lg:px-8 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 p-4 lg:p-6 bg-surface border border-border rounded-xl shadow-sm transition-colors duration-normal">
          <div className="flex-1 mb-4 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Our Products
            </h1>
            {searchParams.get("search") && (
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <p className="text-text-secondary text-sm">
                  Search results for: "{searchParams.get("search")}"
                </p>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-primary/10 border border-primary text-primary rounded-md hover:bg-primary/20 transition-colors duration-normal"
                  onClick={clearSearch}
                  aria-label="Clear search results"
                >
                  <FiX size={12} />
                  Clear Search
                </button>
              </div>
            )}
            {pagination.totalProducts > 0 && (
              <div className="inline-block bg-primary/10 border-l-4 border-primary text-foreground px-3 py-2 rounded-r-md text-sm font-medium">
                {pagination.totalProducts} product
                {pagination.totalProducts !== 1 ? "s" : ""} found
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-surface-elevated rounded-md border border-border p-1 transition-colors duration-normal">
              <button
                className={`p-2 rounded transition-all duration-normal ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "hover:bg-background text-text-secondary"
                }`}
                onClick={() => handleViewModeChange("grid")}
                aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
              {!isMobile && (
                <button
                  className={`p-2 rounded transition-all duration-normal ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "hover:bg-background text-text-secondary"
                  }`}
                  onClick={() => handleViewModeChange("list")}
                  aria-label="List view"
                >
                  <FiList size={16} />
                </button>
              )}
            </div>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-md hover:bg-surface transition-colors duration-normal text-foreground"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <FiRefreshCw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white border border-primary rounded-md hover:bg-primary-dark transition-colors duration-normal"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              aria-label="Toggle filters"
            >
              <FiFilter size={14} />
              <span className="hidden sm:inline">
                {isFilterVisible ? "Hide Filters" : "Show Filters"}
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Layout */}
        <div
          className={`grid gap-6 transition-all duration-300 ${
            isFilterVisible ? "lg:grid-cols-[280px_1fr]" : "grid-cols-1"
          }`}
        >
          {/* Filters Sidebar */}
          {isFilterVisible && (
            <aside className="sticky top-24 h-fit">
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-colors duration-normal">
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
          <section className={`${viewMode === "list" ? "space-y-4" : ""}`}>
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
