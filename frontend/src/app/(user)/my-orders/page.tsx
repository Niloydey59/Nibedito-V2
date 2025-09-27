"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { orderService } from "@/services/orderService";
import { Order } from "@/types/order";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrdersFilterHorizontal } from "@/components/orders/OrdersFilterHorizontal";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [giftFilter, setGiftFilter] = useState("all");
  const [sortByDate, setSortByDate] = useState("latest");
  const [sortByPrice, setSortByPrice] = useState("none");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);

  // Get unique statuses from orders
  const getUniqueStatuses = () => {
    const statuses = orders.map((order) => order.status || "Processing");
    return ["all", ...new Set(statuses)];
  };

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/my-orders");
      return;
    }
    fetchOrders();
  }, [router, user]);

  const fetchOrders = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const sortedOrders = result.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } else {
        toast.error(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Error fetching orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyPagination = useCallback(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setPaginatedOrders(
      filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    );
  }, [filteredOrders, currentPage, ordersPerPage]);

  const applyFilters = useCallback(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (order) =>
          (order.status || "Processing").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      const isPaid = paymentFilter === "paid";
      result = result.filter((order) => order.isPaid === isPaid);
    }

    // Apply gift filter
    if (giftFilter !== "all") {
      if (giftFilter === "gift") {
        result = result.filter((order) => order.isGift === true);
      } else {
        result = result.filter(
          (order) =>
            order.isGift === false ||
            order.isGift === undefined ||
            order.isGift === null
        );
      }
    }

    // Apply date sorting
    if (sortByDate === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortByDate === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // Apply price sorting
    if (sortByPrice === "highest") {
      result.sort((a, b) => (b.finalPrice || 0) - (a.finalPrice || 0));
    } else if (sortByPrice === "lowest") {
      result.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0));
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    orders,
    statusFilter,
    paymentFilter,
    giftFilter,
    sortByDate,
    sortByPrice,
  ]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Apply pagination whenever filtered orders or pagination settings change
  useEffect(() => {
    applyPagination();
  }, [applyPagination]);

  const resetFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setGiftFilter("all");
    setSortByDate("latest");
    setSortByPrice("none");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Construct PaginationInfo based on current filtered orders and pagination state
  const paginationInfo: PaginationInfo = {
    total: filteredOrders.length,
    pages: Math.ceil(filteredOrders.length / ordersPerPage),
    page: currentPage,
    limit: ordersPerPage,
    hasNext: currentPage < Math.ceil(filteredOrders.length / ordersPerPage),
    hasPrev: currentPage > 1,
    nextPage:
      currentPage < Math.ceil(filteredOrders.length / ordersPerPage)
        ? currentPage + 1
        : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!orders.length) {
    return <OrdersEmptyState type="no-orders" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <OrdersHeader />

          <OrdersFilterHorizontal
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            giftFilter={giftFilter}
            setGiftFilter={setGiftFilter}
            sortByDate={sortByDate}
            setSortByDate={setSortByDate}
            sortByPrice={sortByPrice}
            setSortByPrice={setSortByPrice}
            uniqueStatuses={getUniqueStatuses()}
            totalOrders={orders.length}
            filteredOrdersLength={filteredOrders.length}
            resetFilters={resetFilters}
          />

          {filteredOrders.length === 0 ? (
            <OrdersEmptyState
              type="no-filtered-orders"
              onResetFilters={resetFilters}
            />
          ) : (
            <>
              <div className="space-y-6">
                {paginatedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>

              <Pagination
                pagination={paginationInfo}
                onPageChange={handlePageChange}
                showInfo={true} // Optional: Shows "Showing X to Y of Z items"
                className="mt-8" // Optional: Add styling if needed
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
