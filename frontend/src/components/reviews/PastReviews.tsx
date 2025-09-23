"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit3,
  Star,
  Calendar,
  Package,
  Filter,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReviewCard from "./ReviewCard";
import EditReviewModal from "./EditReviewModal";
import { reviewService } from "@/services/reviewService";
import { Review, GetUserReviewsParams } from "@/types/review";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";

export default function PastReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating-high" | "rating-low"
  >("newest");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null,
  });
  const [limit, setLimit] = useState<number>(10); // Added: State for items per page

  const fetchReviews = useCallback(
    async (page: number = 1, limitParam: number = limit) => {
      try {
        setLoading(true);
        const response = await reviewService.getUserReviews({
          page,
          limit: limitParam,
        });

        if (response.success && response.payload) {
          setReviews(response.payload.reviews);
          setPagination(response.payload.pagination);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // You can add a proper toast notification here later
        alert("Failed to load your reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // In a real implementation, you'd debounce this and call the API with search params
  };

  const handleSort = (value: typeof sortBy) => {
    setSortBy(value);
    // In a real implementation, you'd call the API with sort params
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleUpdateReview = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((review) =>
        review._id === updatedReview._id ? updatedReview : review
      )
    );
    setEditingReview(null);
  };

  const filteredReviews = reviews.filter((review) => {
    const productName =
      typeof review.product === "object" ? review.product.name : "";
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    fetchReviews(1, newLimit); // Reset to page 1 when limit changes
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
          <Input
            placeholder="Search your reviews..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Sort by
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("newest")}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("oldest")}>
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("rating-high")}>
              Highest Rating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("rating-low")}>
              Lowest Rating
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reviews Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Reviews</p>
                <p className="text-xl font-semibold">
                  {pagination.totalReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-warning/10 p-2 rounded-lg">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Average Rating</p>
                <p className="text-xl font-semibold">
                  {reviews.length > 0
                    ? (
                        reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / reviews.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-2 rounded-lg">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Products Reviewed</p>
                <p className="text-xl font-semibold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-text-secondary mb-4">
              {searchTerm
                ? `No reviews match your search "${searchTerm}"`
                : "You haven't written any reviews yet."}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={() => handleEditReview(review)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showLimitSelector={true}
        limitOptions={[5, 10, 25, 50]}
        className="mt-8"
      />

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdate={handleUpdateReview}
        />
      )}
    </div>
  );
}
