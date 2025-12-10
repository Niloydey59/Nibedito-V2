"use client";

import { useState, useEffect } from "react";
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
      setLoading(true);
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

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark review as helpful");
    }
  };

  if (loading && page === 1) {
    return <LoadingSpinner fullPage={false} size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      {stats && <ReviewStatsBar stats={stats} />}

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalReviews={stats?.totalReviews || 0}
      />

      {/* Reviews */}
      <div className="space-y-4">
        {loading && page > 1 ? (
          <LoadingSpinner fullPage={false} size="md" />
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-secondary text-lg">No reviews yet</p>
            <p className="text-text-secondary text-sm mt-2">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpfulClick={handleHelpfulClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
