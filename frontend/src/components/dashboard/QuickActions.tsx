"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiShoppingBag, FiHeart, FiMessageSquare, FiLock, FiMapPin } from "react-icons/fi";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function QuickActions(): React.JSX.Element {
  const actions: QuickAction[] = [
    {
      title: "My Orders",
      description: "Track and manage orders",
      icon: <FiShoppingBag className="w-5 h-5" />,
      href: "/my-orders",
      color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30",
    },
    {
      title: "Wishlist",
      description: "View saved items",
      icon: <FiHeart className="w-5 h-5" />,
      href: "/wishlist",
      color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/30",
    },
    {
      title: "Reviews",
      description: "Manage your reviews",
      icon: <FiMessageSquare className="w-5 h-5" />,
      href: "/my-reviews",
      color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30",
    },
    {
      title: "Addresses",
      description: "Manage delivery addresses",
      icon: <FiMapPin className="w-5 h-5" />,
      href: "/profile",
      color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/30",
    },
    {
      title: "Security",
      description: "Password & settings",
      icon: <FiLock className="w-5 h-5" />,
      href: "/security",
      color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30",
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors group"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
