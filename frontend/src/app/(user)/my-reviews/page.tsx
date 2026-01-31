"use client";

import { useState } from "react";
import { MessageSquare, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PastReviews from "@/components/reviews/PastReviews";
import PendingReviews from "@/components/reviews/PendingReviews";

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState("past");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header Section - Simplified, no hover effects */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-xl">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                My Reviews
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your product reviews and share your experiences
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Tabs - Simplified styling */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-xl font-semibold">
              Review Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1 h-auto">
                <TabsTrigger
                  value="past"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Past Reviews</span>
                  <span className="sm:hidden">Past</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Pending Reviews</span>
                  <span className="sm:hidden">Pending</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="past" className="mt-0">
                <PastReviews />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <PendingReviews />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
