"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/dashboard/UserProfile";
import VerificationStatus from "@/components/dashboard/VerificationStatus";
import SecuritySettings from "@/components/dashboard/SecuritySettings";
import OrderSummary from "@/components/dashboard/OrderSummary";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FiLogOut, FiGrid } from "react-icons/fi";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      setIsDataLoaded(true);
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/login");
    }
  }, [mounted, isLoading, user, router]);

  // Show loading until everything is ready
  if (!mounted || isLoading || !user || !isDataLoaded) {
    return <LoadingSpinner fullPage={true} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-4 py-6 lg:py-12 max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-8 lg:mb-12">
            <div className="dashboard-header-gradient relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-red-400/30 to-red-300/20 dark:from-primary/20 dark:to-accent/20" />
                <svg
                  className="absolute right-0 top-0 h-full w-1/3"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    fill="currentColor"
                    points="50,0 100,0 100,100"
                    opacity="0.1"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 lg:p-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-300/80 to-red-500/70 dark:from-blue-600/40 dark:to-indigo-500/30 rounded-xl blur-sm animate-pulse" />
                      <div className="relative p-3 bg-gradient-to-br from-white/90 to-red-100/80 dark:from-primary dark:to-accent backdrop-blur-sm rounded-xl shadow-lg border border-red-300/60 dark:border-blue-700/30">
                        <FiGrid className="w-7 h-7 text-red-700 dark:text-white drop-shadow-sm" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-black text-white dark:text-foreground drop-shadow-md tracking-tight">
                        <span className="bg-gradient-to-r from-white via-red-100 to-white dark:from-slate-200 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                          Dashboard
                        </span>
                      </h1>
                      <p className="text-red-50 dark:text-text-secondary font-medium drop-shadow-sm text-lg">
                        Welcome back,{" "}
                        <span className="text-white dark:text-blue-400 font-semibold">
                          {user.name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-white/60 dark:border-slate-600 text-red-600 dark:text-orange-400 hover:bg-red-50/90 dark:hover:bg-orange-950/30 hover:border-red-200/80 dark:hover:border-orange-700/50 hover:text-red-700 dark:hover:text-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>

              {/* Enhanced Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/80 via-red-400/70 via-red-300/60 to-red-200/50 dark:from-blue-600/40 dark:via-indigo-600/30 dark:via-purple-600/25 dark:to-rose-600/15 z-10" />
            </div>
          </div>

          {/* Enhanced Dashboard Grid */}
          <div className="space-y-6 lg:space-y-8">
            {/* First row: Profile and Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <UserProfile user={user} />
              <OrderSummary />
            </div>

            {/* Second row: Verification and Security */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <VerificationStatus user={user} />
              <SecuritySettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
