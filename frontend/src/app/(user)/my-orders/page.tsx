"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/orderService";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  FiShoppingBag,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiGift,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiRotateCcw,
} from "react-icons/fi";

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
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Mobile first - hidden by default

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage, endPage;
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "").replace(/^0+/, "");
    return cleaned.length === 10 ? `+880${cleaned}` : `+880${cleaned}`;
  };

  const getStatusIcon = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="w-4 h-4" />;
      case "shipped":
        return <FiTruck className="w-4 h-4" />;
      case "processing":
        return <FiPackage className="w-4 h-4" />;
      case "cancelled":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "shipped":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      case "processing":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white";
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 lg:p-12 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-xl">
                  <FiShoppingBag className="w-16 h-16 lg:w-20 lg:h-20 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                No Orders Found
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                You haven't placed any orders yet. Start shopping to see your
                orders here!
              </p>
              <Link
                href="/products"
                className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group hover:text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  Start Shopping
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-4 p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <FiShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        My Orders
                      </h1>
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-medium">
                        Track and manage your orders
                      </p>
                    </div>
                  </div>

                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    className="lg:hidden gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  >
                    <FiFilter className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Filter Sidebar */}
            <div
              className={`lg:col-span-1 ${
                isFilterVisible ? "block" : "hidden lg:block"
              }`}
            >
              <div className="lg:sticky lg:top-6 space-y-4">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border-b border-indigo-100 dark:border-indigo-800/30">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
                          <FiFilter className="w-4 h-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                          Filter Orders
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFilterVisible(false)}
                        className="lg:hidden p-1 h-auto"
                      >
                        <FiX className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 space-y-6">
                    {/* Order Status Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Order Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        {getUniqueStatuses().map((status) => (
                          <option key={status} value={status.toLowerCase()}>
                            {status === "all" ? "All Statuses" : status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Payment Status
                      </label>
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>

                    {/* Order Type Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Order Type
                      </label>
                      <select
                        value={giftFilter}
                        onChange={(e) => setGiftFilter(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        <option value="all">All Orders</option>
                        <option value="gift">Gift Orders</option>
                        <option value="personal">Personal Orders</option>
                      </select>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                    {/* Sort by Date */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sort by Date
                      </label>
                      <select
                        value={sortByDate}
                        onChange={(e) => setSortByDate(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        <option value="latest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>

                    {/* Sort by Price */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sort by Price
                      </label>
                      <select
                        value={sortByPrice}
                        onChange={(e) => setSortByPrice(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        <option value="none">No Price Sorting</option>
                        <option value="highest">Highest Price First</option>
                        <option value="lowest">Lowest Price First</option>
                      </select>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                    {/* Reset Filters */}
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <FiRotateCcw className="w-4 h-4" />
                      Reset Filters
                    </Button>

                    {/* Filter Summary */}
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                        Showing {paginatedOrders.length} of{" "}
                        {filteredOrders.length} orders
                        {filteredOrders.length > ordersPerPage &&
                          ` (Page ${currentPage} of ${totalPages})`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Orders Content */}
            <div className="lg:col-span-3">
              {filteredOrders.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-8 lg:p-12 text-center">
                    <div className="mb-6">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                        <FiFilter className="w-12 h-12 lg:w-16 lg:h-16 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                      No orders match your filters
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button
                      onClick={resetFilters}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Orders List */}
                  <div className="space-y-6">
                    {paginatedOrders.map((order) => (
                      <Card
                        key={order._id}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Order Header */}
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-b border-slate-200/50 dark:border-slate-700/50 p-4 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg shadow-md">
                                <FiPackage className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                  Order #
                                  {order._id.substring(order._id.length - 8)}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                  {formatDate(
                                    order.dateOrdered || order.createdAt
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                className={`gap-1 px-3 py-1 font-medium shadow-sm ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status || "Processing"}
                              </Badge>
                              {order.isPaid ? (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                                  <FiCheckCircle className="w-3 h-3" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                                  <FiClock className="w-3 h-3" />
                                  Unpaid
                                </Badge>
                              )}
                              {order.isGift === true && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                                  <FiGift className="w-3 h-3" />
                                  Gift
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              {order.isGift === true ? (
                                <>
                                  <FiGift className="w-4 h-4 text-purple-500" />
                                  <span>Gift Order</span>
                                </>
                              ) : (
                                <>
                                  <FiUser className="w-4 h-4 text-blue-500" />
                                  <span>Personal Order</span>
                                </>
                              )}
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                              ৳{formatPrice(order.finalPrice)}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 lg:p-6 space-y-6">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <FiPackage className="w-4 h-4" />
                              Order Items ({order.items?.length || 0})
                            </h4>
                            <div className="space-y-3">
                              {order.items?.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex items-center gap-4 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                                    {item.product?.thumbnailImage ? (
                                      <img
                                        src={item.product.thumbnailImage}
                                        alt={item.product?.name || "Product"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                                        {item.product?.name?.charAt(0) || "P"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-slate-900 dark:text-white truncate">
                                      {item.product?.name || "Product"}
                                    </h5>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                      <span>Qty: {item.quantity || 0}</span>
                                      <span>
                                        Per item: ৳
                                        {formatPrice(
                                          item.cost / (item.quantity || 1)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                      ৳{formatPrice(item.cost)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                          {/* Shipping and Gift Information */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Shipping Information */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiMapPin className="w-4 h-4 text-green-500" />
                                Shipping Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-slate-600 dark:text-slate-400">
                                  <span className="font-medium">Address:</span>{" "}
                                  {order.street}, {order.city}, {order.state}
                                </p>
                                {order.addressDetails && (
                                  <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">
                                      Details:
                                    </span>{" "}
                                    {order.addressDetails}
                                  </p>
                                )}
                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  <FiPhone className="w-3 h-3" />
                                  {formatPhoneNumber(order.phone)}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  <FiMail className="w-3 h-3" />
                                  {order.email}
                                </p>
                              </div>
                            </div>

                            {/* Gift Information */}
                            {order.isGift === true && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <FiGift className="w-4 h-4 text-purple-500" />
                                  Gift Information
                                </h4>
                                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                                  {order.giftNote ? (
                                    <div>
                                      <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                                        Gift Message:
                                      </p>
                                      <p className="text-purple-800 dark:text-purple-200 text-sm italic">
                                        "{order.giftNote}"
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-purple-800 dark:text-purple-200 text-sm">
                                      This order will be prepared as a gift.
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="space-y-3 lg:col-span-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                Price Breakdown
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    Subtotal
                                  </p>
                                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                    ৳{formatPrice(order.totalPrice)}
                                  </p>
                                </div>
                                <div className="p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Shipping
                                  </p>
                                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                    ৳{formatPrice(order.shippingCost)}
                                  </p>
                                </div>
                                {order.discountAmount > 0 && (
                                  <div className="p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                      Discount
                                    </p>
                                    <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                                      -৳{formatPrice(order.discountAmount)}
                                    </p>
                                  </div>
                                )}
                                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    Total
                                  </p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    ৳{formatPrice(order.finalPrice)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="gap-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-slate-500"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={
                                currentPage === page
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              }
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="gap-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      >
                        Next
                        <FiChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
