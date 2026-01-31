"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import QuickActions from "@/components/dashboard/QuickActions";
import AccountSummary from "@/components/dashboard/AccountSummary";
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <DashboardHeader user={user} onLogout={handleLogout} />

        {/* Main Content Grid */}
        <div className="mt-6 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Mobile Order: Account Summary first */}
          <div className="lg:hidden space-y-6">
            <AccountSummary user={user} />
            <QuickActions />
            <DashboardOverview />
            <RecentOrders />
          </div>

          {/* Desktop Layout - Original order */}
          <div className="hidden lg:block lg:col-span-8 space-y-6">
            <DashboardOverview />
            <RecentOrders />
          </div>

          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <AccountSummary user={user} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
