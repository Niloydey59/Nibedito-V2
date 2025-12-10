"use client";

import { FiFilter } from "react-icons/fi";

interface ReviewFiltersProps {
  filters: {
    rating: number | undefined;
    sortBy: "createdAt" | "rating" | "helpful";
    sortOrder: "asc" | "desc";
  };
  onFilterChange: (filters: any) => void;
  totalReviews: number;
}

export default function ReviewFilters({
  filters,
  onFilterChange,
  totalReviews,
}: ReviewFiltersProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Total Reviews */}
        <div className="flex items-center gap-2">
          <FiFilter className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">
            {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Rating Filter */}
          <select
            value={filters.rating || ""}
            onChange={(e) =>
              onFilterChange({
                rating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as "createdAt" | "rating" | "helpful",
              })
            }
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt">Most Recent</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() =>
              onFilterChange({
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-primary/5 transition-colors"
          >
            {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>
    </div>
  );
}
