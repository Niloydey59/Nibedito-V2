"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ProductGrid from "@/components/products/ProductGrid";
import CategoryHeader from "@/components/categories/CategoryHeader";
import CategoryFilters from "@/components/categories/CategoryFilters";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { subcategoryService } from "@/services/subcategoryService";
import { FiGrid, FiList, FiFilter, FiRefreshCw } from "react-icons/fi";
import type { Product, Pagination } from "@/types/product";
import type { Category } from "@/types/category";
import type { Subcategory } from "@/types/subcategory";

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Update selectedSubcategory from searchParams whenever it changes
  const selectedSubcategory = searchParams.get("subcategory") || "";

  // Convert URL parameters to values needed by the API
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12"); // Show 12 products per page by default
  const sortBy = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchCategoryData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        // Fetch category data
        const categoryData = await categoryService.getCategory(slug);
        setCategory(categoryData);

        // Fetch subcategories for this category
        const subcategoriesData =
          await subcategoryService.getSubcategoriesByCategory(
            categoryData._id!
          );
        setSubcategories(subcategoriesData);

        // Convert sort values to API parameters
        let sortField = "createdAt";
        let sortOrder = "desc";

        switch (sortBy) {
          case "price-low":
            sortField = "price";
            sortOrder = "asc";
            break;
          case "price-high":
            sortField = "price";
            sortOrder = "desc";
            break;
          case "rating":
            sortField = "rating";
            sortOrder = "desc";
            break;
          default:
            sortField = "createdAt";
            sortOrder = "desc";
        }

        // Fetch products with pagination and filters
        const params = {
          page,
          limit,
          search,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sortField,
          sortOrder,
        };

        console.log("Current subcategory filter:", selectedSubcategory);

        // If a subcategory is selected, update the params
        if (selectedSubcategory) {
          console.log("Fetching products by subcategory:", selectedSubcategory);
          // Get products by subcategory
          const productsData = await productService.getProductsBySubcategory(
            selectedSubcategory,
            params
          );
          console.log("Products from subcategory:", productsData);
          setProducts(productsData.products);
          setPagination({
            currentPage: productsData.pagination.currentPage,
            totalPages: productsData.pagination.totalPages,
            hasNextPage: productsData.pagination.hasNextPage,
            hasPrevPage: productsData.pagination.hasPrevPage,
            totalItems: productsData.pagination.totalItems,
            limit: productsData.pagination.limit || limit,
          });
        } else {
          console.log("Fetching products by category only");
          // Get products by category only
          const productsData = await productService.getProductsByCategory(
            slug,
            params
          );
          console.log("Products from category:", productsData);
          setProducts(productsData.products);
          setPagination({
            currentPage: productsData.pagination.currentPage,
            totalPages: productsData.pagination.totalPages,
            hasNextPage: productsData.pagination.hasNextPage,
            hasPrevPage: productsData.pagination.hasPrevPage,
            totalItems: productsData.pagination.totalItems,
            limit: productsData.pagination.limit || limit,
          });
        }
      } catch (err: any) {
        console.error("Error fetching category data:", err);
        setError(err.message || "Failed to fetch category data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [
    slug,
    selectedSubcategory,
    page,
    limit,
    sortBy,
    minPrice,
    maxPrice,
    search,
    searchParams,
  ]);

  // Add window resize listener for responsive behavior
  useEffect(() => {
    // Initialize filter visibility and check if mobile
    const checkMobile = () => window.innerWidth <= 768;
    setIsMobile(checkMobile());
    setIsFilterVisible(window.innerWidth > 768);

    const handleResize = () => {
      // Update mobile state
      const mobile = checkMobile();
      setIsMobile(mobile);

      // Hide filters by default on mobile screens
      if (mobile) {
        setIsFilterVisible(false);
        setShowMobileOverlay(false);

        // Force grid view on mobile
        if (viewMode === "list") {
          setViewMode("grid");
        }
      } else {
        setIsFilterVisible(true);
        setShowMobileOverlay(false);
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
  }, [viewMode]);

  const handlePageChange = (newPage: number): void => {
    setIsLoading(true); // Show loading state
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSubcategoryChange = (subcategorySlug: string): void => {
    setIsLoading(true); // Show loading state
    const params = new URLSearchParams(searchParams.toString());

    if (subcategorySlug) {
      params.set("subcategory", subcategorySlug);
    } else {
      params.delete("subcategory");
    }

    // Reset to page 1 when changing subcategory
    params.set("page", "1");
    router.push(`?${params.toString()}`);

    // On mobile, hide filter after selection
    if (isMobile) {
      setIsFilterVisible(false);
    }
  };

  // Reset all filters to default
  const resetFilters = (): void => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sort", "newest");
    // Availability and subcategory are cleared by not including them
    router.push(`?${params.toString()}`);
  };

  // Toggle filter visibility with overlay for mobile
  const toggleFilters = (): void => {
    const newState = !isFilterVisible;
    setIsFilterVisible(newState);

    // Toggle overlay only on mobile
    if (isMobile) {
      setShowMobileOverlay(newState);

      // Prevent scrolling on body when filter is open on mobile
      if (newState) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  // Hide filters function (used by the filter component)
  const hideFilters = (): void => {
    setIsFilterVisible(false);
    setShowMobileOverlay(false);
    document.body.style.overflow = "";
  };

  return (
    <main className="category-subcategory-page products-page">
      <div className="products-container">
        {/* Category Header Banner */}
        <CategoryHeader
          category={category}
          isLoading={isLoading}
          productCount={pagination.totalItems || products.length}
        />

        {/* Product Controls Header */}
        <header className="products-header">
          <div className="header-content">
            <h1 className="page-title">
              {category ? category.name : "Loading..."}
            </h1>
            {pagination.totalItems > 0 && (
              <p className="results-count">
                {pagination.totalItems} product
                {pagination.totalItems !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
          <div className="view-controls">
            <div className="view-btn-container">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid />
              </button>
              {!isMobile && (
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <FiList />
                </button>
              )}
            </div>
            <button
              className="reset-filters-btn"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <FiRefreshCw />
              Reset
            </button>
            <button
              className="filter-toggle-btn"
              onClick={toggleFilters}
              aria-label="Toggle filters"
            >
              <FiFilter />
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </header>

        {/* Mobile overlay for filter background */}
        {showMobileOverlay && (
          <div
            className="mobile-filter-overlay visible"
            onClick={hideFilters}
          ></div>
        )}

        <div
          className={`products-layout ${
            isFilterVisible ? "with-filters" : "no-filters"
          }`}
        >
          {/* Left Sidebar */}
          {isFilterVisible && (
            <aside className="filters-sidebar">
              <div className="mobile-filters-wrapper">
                {/* Category Filters */}
                <CategoryFilters
                  onHideFilters={hideFilters}
                  isMobile={isMobile}
                  categoryId={category?._id}
                />
              </div>
            </aside>
          )}

          {/* Product Grid/List on the right */}
          <section className={`products-content ${viewMode}`}>
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
