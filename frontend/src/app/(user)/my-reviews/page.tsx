"use client";

import { useState } from "react";
import { MessageSquare, Clock, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PastReviews from "@/components/reviews/PastReviews";
import PendingReviews from "@/components/reviews/PendingReviews";

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState("past");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-color to-background-secondary">
      <div className="container py-8">
        {/* Header Section */}
        <div className="dashboard-header-gradient rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  My Reviews
                </h1>
                <p className="text-white/90 text-lg">
                  Manage your product reviews and share your experiences
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <Star className="h-20 w-20 text-white" />
          </div>
          <div className="absolute bottom-4 right-8 opacity-10">
            <Clock className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Reviews Tabs */}
        <Card className="card-modern">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Review Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger
                  value="past"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Past Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  Pending Reviews
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
