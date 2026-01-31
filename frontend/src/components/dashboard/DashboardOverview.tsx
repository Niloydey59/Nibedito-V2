"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/orderService";
import { FiShoppingBag, FiPackage, FiCheckCircle, FiClock } from "react-icons/fi";
import type { Order } from "@/types";

interface StatsCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function DashboardOverview(): React.JSX.Element {
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    delivered: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async (): Promise<void> => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const orders: Order[] = result.data;
        setStats({
          total: orders.length,
          processing: orders.filter((o) => o.status?.toLowerCase() === "processing").length,
          delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
          pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
        });
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards: StatsCard[] = [
    {
      title: "Total Orders",
      value: stats.total,
      icon: <FiShoppingBag className="w-6 h-6" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      title: "Processing",
      value: stats.processing,
      icon: <FiPackage className="w-6 h-6" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-950/30",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950/30",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <FiClock className="w-6 h-6" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
