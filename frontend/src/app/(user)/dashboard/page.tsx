"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import type { AuthContextType } from "@/contexts/AuthContext";

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, isLoading, logout }: AuthContextType = useAuth();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/login");
    }
  }, [mounted, isLoading, user, router]);

  if (!mounted || isLoading || !user) {
    return <LoadingSpinner fullPage={true} />;
  }

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <DashboardSidebar user={user} onLogout={handleLogout} />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8 max-w-5xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {getGreeting()},{" "}
                <span className="text-rose-600 dark:text-rose-400">
                  {user.name.split(" ")[0]}
                </span>
                !
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>

            {/* Stats Overview */}
            <section aria-label="Order statistics" className="mb-6">
              <DashboardOverview />
            </section>

            {/* Recent Orders */}
            <section aria-label="Recent orders">
              <RecentOrders />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
