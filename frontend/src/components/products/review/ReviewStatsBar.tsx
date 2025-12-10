"use client";

import { ReviewStats } from "@/types";
import { FiStar } from "react-icons/fi";

interface ReviewStatsBarProps {
  stats: ReviewStats;
}

export default function ReviewStatsBar({ stats }: ReviewStatsBarProps) {
  const getRatingCount = (rating: number) => {
    const stat = stats.stats.find((s) => s.rating === rating);
    return stat ? stat.count : 0;
  };

  const getRatingPercentage = (rating: number) => {
    const stat = stats.stats.find((s) => s.rating === rating);
    return stat ? stat.percentage : 0;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
          <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            Based on {stats.totalReviews} reviews
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-[3rem]">
                <span className="text-sm font-medium text-foreground">
                  {rating}
                </span>
                <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className="text-sm text-text-secondary min-w-[3rem] text-right">
                {getRatingCount(rating)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
