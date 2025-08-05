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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 lg:p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FiGrid className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                    Welcome back,{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {user.name}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 shadow-md"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
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
