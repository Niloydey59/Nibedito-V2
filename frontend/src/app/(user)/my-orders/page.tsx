"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/orderService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrdersFilter } from "@/components/orders/OrdersFilter";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrdersPagination } from "@/components/orders/OrdersPagination";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [giftFilter, setGiftFilter] = useState("all");
  const [sortByDate, setSortByDate] = useState("latest");
  const [sortByPrice, setSortByPrice] = useState("none");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [paginatedOrders, setPaginatedOrders] = useState([]);

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
  }, [user]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [
    statusFilter,
    paymentFilter,
    giftFilter,
    sortByDate,
    sortByPrice,
    orders,
  ]);

  // Apply pagination whenever filtered orders or pagination settings change
  useEffect(() => {
    applyPagination();
  }, [filteredOrders, currentPage, ordersPerPage]);

  const fetchOrders = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success) {
        const sortedOrders = result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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

  const applyFilters = () => {
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
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortByDate === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Apply price sorting
    if (sortByPrice === "highest") {
      result.sort((a, b) => (b.finalPrice || 0) - (a.finalPrice || 0));
    } else if (sortByPrice === "lowest") {
      result.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0));
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyPagination = () => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setPaginatedOrders(
      filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    );
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setGiftFilter("all");
    setSortByDate("latest");
    setSortByPrice("none");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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
          <OrdersHeader
            isFilterVisible={isFilterVisible}
            setIsFilterVisible={setIsFilterVisible}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <OrdersFilter
              isFilterVisible={isFilterVisible}
              setIsFilterVisible={setIsFilterVisible}
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
              paginatedOrdersLength={paginatedOrders.length}
              filteredOrdersLength={filteredOrders.length}
              ordersPerPage={ordersPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              resetFilters={resetFilters}
            />

            <div className="lg:col-span-3">
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

                  <OrdersPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
