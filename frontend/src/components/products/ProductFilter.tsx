"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiX, FiFilter } from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";

export default function ProductFilters({
  filters,
  onFilterChange,
  categories,
  onHideFilters,
}) {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    category: true,
    availability: true,
  });
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  useEffect(() => {
    if (filters.category) {
      fetchSubcategories(filters.category);
    } else {
      setSubcategories([]);
    }
  }, [filters.category]);

  const fetchSubcategories = async (categoryId) => {
    try {
      setLoadingSubcategories(true);
      const data = await subcategoryService.getSubcategoriesByCategory(
        categoryId
      );
      setSubcategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSortChange = (sortValue) => {
    onFilterChange({ sort: sortValue });
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      category: categoryId,
      subcategory: "", // Reset subcategory when category changes
    });
  };

  const handleSubcategoryChange = (subcategoryId) => {
    onFilterChange({ subcategory: subcategoryId });
  };

  const handlePriceChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleAvailabilityChange = (value) => {
    onFilterChange({ inStock: value });
  };

  const clearFilters = () => {
    onFilterChange({
      minPrice: "",
      maxPrice: "",
      category: "",
      subcategory: "",
      inStock: undefined,
      sort: "newest",
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.subcategory ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock !== undefined;

  const FilterSection = ({ title, isExpanded, onToggle, children, icon }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-background transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <FiChevronDown
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          size={16}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FiFilter size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-2 py-1 text-info border border-info rounded-md hover:bg-info hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onHideFilters}
            className="lg:hidden p-1 hover:bg-background rounded transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Sort Section */}
        <FilterSection
          title="Sort By"
          isExpanded={expandedSections.sort}
          onToggle={() => toggleSection("sort")}
        >
          <div className="space-y-2">
            {[
              { value: "newest", label: "Newest First" },
              { value: "price-low", label: "Price: Low to High" },
              { value: "price-high", label: "Price: High to Low" },
              { value: "name-asc", label: "Name: A to Z" },
              { value: "name-desc", label: "Name: Z to A" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full text-left p-3 rounded-md border transition-all text-sm ${
                  filters.sort === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                <div className="flex items-center justify-between">
                  {option.label}
                  {filters.sort === option.value && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range Section */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handlePriceChange("minPrice", e.target.value)
                  }
                  className="input input-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handlePriceChange("maxPrice", e.target.value)
                  }
                  className="input input-sm w-full"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Category Section */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection("category")}
        >
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={`w-full text-left p-3 rounded-md border transition-all text-sm ${
                !filters.category
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              <div className="flex items-center justify-between">
                All Categories
                {!filters.category && <span className="text-xs">✓</span>}
              </div>
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryChange(category._id)}
                className={`w-full text-left p-3 rounded-md border transition-all text-sm ${
                  filters.category === category._id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                <div className="flex items-center justify-between">
                  {category.name}
                  {filters.category === category._id && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {filters.category && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Subcategories
              </h4>
              {loadingSubcategories ? (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : subcategories.length > 0 ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleSubcategoryChange("")}
                    className={`w-full text-left p-2 rounded-md border transition-all text-sm ${
                      !filters.subcategory
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      All Subcategories
                      {!filters.subcategory && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </button>
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory._id}
                      onClick={() => handleSubcategoryChange(subcategory._id)}
                      className={`w-full text-left p-2 rounded-md border transition-all text-sm ${
                        filters.subcategory === subcategory._id
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {subcategory.name}
                        {filters.subcategory === subcategory._id && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  No subcategories available
                </div>
              )}
            </div>
          )}
        </FilterSection>

        {/* Availability Section */}
        <FilterSection
          title="Availability"
          isExpanded={expandedSections.availability}
          onToggle={() => toggleSection("availability")}
        >
          <div className="space-y-2">
            {[
              { value: undefined, label: "All Products" },
              { value: true, label: "In Stock Only" },
              { value: false, label: "Out of Stock" },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleAvailabilityChange(option.value)}
                className={`w-full text-left p-3 rounded-md border transition-all text-sm ${
                  filters.inStock === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                <div className="flex items-center justify-between">
                  {option.label}
                  {filters.inStock === option.value && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
