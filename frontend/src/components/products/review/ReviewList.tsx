"use client";

import { useState, useEffect, useCallback } from "react";
import { reviewService } from "@/services/reviewService";
import { Review, ReviewStats } from "@/types";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ReviewCard from "./ReviewCard";
import ReviewFilters from "./ReviewFilters";
import ReviewStatsBar from "./ReviewStatsBar";
import Pagination from "./Pagination";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    rating: undefined as number | undefined,
    sortBy: "createdAt" as "createdAt" | "rating" | "helpful",
    sortOrder: "desc" as "asc" | "desc",
  });
  const toast = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId, page, filters]);

  useEffect(() => {
    fetchStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      if (reviews.length === 0) {
        setLoading(true);
      } else {
        setUpdating(true);
      }

      const response = await reviewService.getProductReviews(productId, {
        page,
        limit: 5,
        rating: filters.rating,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setReviews(response.payload.reviews);
      setTotalPages(response.payload.pagination.pages);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewService.getReviewStats(productId);
      setStats(response.payload);
    } catch (error) {
      console.error("Failed to fetch review stats:", error);
    }
  };

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPage(1);
    },
    []
  );

  const handleRatingClick = useCallback(
    (rating: number | undefined) => {
      handleFilterChange({ rating });
    },
    [handleFilterChange]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleHelpfulClick = useCallback(
    async (reviewId: string) => {
      try {
        // Optimistic update
        setReviews((prevReviews) =>
          prevReviews.map((review) => {
            if (review._id === reviewId) {
              const userId = localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!)?._id
                : null;

              if (!userId) return review;

              const isCurrentlyHelpful = review.helpfulUsers.includes(userId);
              return {
                ...review,
                helpful: isCurrentlyHelpful ? review.helpful - 1 : review.helpful + 1,
                helpfulUsers: isCurrentlyHelpful
                  ? review.helpfulUsers.filter((id) => id !== userId)
                  : [...review.helpfulUsers, userId],
              };
            }
            return review;
          })
        );

        // Make API call
        await reviewService.markReviewHelpful(reviewId);

        // Refresh stats in background
        fetchStats();
      } catch (error: any) {
        toast.error(error.message || "Failed to mark review as helpful");
        // Revert optimistic update on error
        fetchReviews();
      }
    },
    [toast]
  );

  if (loading && page === 1) {
    return <LoadingSpinner fullPage={false} size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar with clickable rating bars */}
      {stats && (
        <ReviewStatsBar
          stats={stats}
          onRatingClick={handleRatingClick}
          selectedRating={filters.rating}
        />
      )}

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalReviews={stats?.totalReviews || 0}
      />

      {/* Reviews with smooth transition */}
      <div
        className={`space-y-4 transition-opacity duration-300 ${
          updating ? "opacity-50" : "opacity-100"
        }`}
      >
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl animate-fade-in">
            <p className="text-text-secondary text-lg">No reviews yet</p>
            <p className="text-text-secondary text-sm mt-2">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ReviewCard review={review} onHelpfulClick={handleHelpfulClick} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
