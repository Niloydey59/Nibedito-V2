"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import UserProfile from "@/components/dashboard/UserProfile";
import { FiUser } from "react-icons/fi";

export default function ProfilePage(): React.JSX.Element {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
            <FiUser className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        {/* Profile Component */}
        <UserProfile user={user} />
      </div>
    </div>
  );
}
