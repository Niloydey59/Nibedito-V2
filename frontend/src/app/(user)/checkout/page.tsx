"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { previewCoupon, applyCoupon } from "@/services/couponService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  FiShoppingCart,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGift,
  FiTag,
  FiTruck,
  FiCreditCard,
  FiCheck,
  FiX,
} from "react-icons/fi";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, clearCart, refetchCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    addressDetails: "",
    phone: "",
    email: "",
  });
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!cartLoading && (!cart || !cart.items?.length) && !orderPlaced) {
      router.push("/cart");
      return;
    }

    // Find default address
    const defaultAddress =
      user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

    // Initialize form data with user info and default address
    setFormData({
      street: defaultAddress?.street || "",
      city: defaultAddress?.city || "",
      state: defaultAddress?.state || "",
      addressDetails: "",
      phone: user.phone || "",
      email: user.email || "",
    });

    fetchShippingRates();
  }, [user, cart, cartLoading, orderPlaced]);

  // Effect to handle redirection after order placement
  useEffect(() => {
    if (orderPlaced) {
      router.push("/my-orders");
    }
  }, [orderPlaced, router]);

  const fetchShippingRates = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipping/rates`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setShippingRates(data.payload);
        setSelectedShipping(data.payload[0]?.region || "");
      }
      setLoading(false);
    } catch (error) {
      console.error("Shipping error:", error);
      toast.error("Failed to fetch shipping rates");
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplying(true);
    try {
      const data = await previewCoupon({
        couponCode,
        shippingRegion: selectedShipping,
      });

      if (data.success) {
        toast.success("Coupon applied successfully");
        setAppliedCoupon({
          code: couponCode,
          couponId: data.payload.couponId,
          productDiscountAmount: data.payload.productDiscountAmount,
          shippingDiscountAmount: data.payload.shippingDiscountAmount,
          finalPrice: data.payload.finalPrice,
          finalShippingCost: data.payload.finalShippingCost,
        });
      } else {
        toast.error(data.message || "Failed to apply coupon");
        setCouponCode("");
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply coupon");
      setCouponCode("");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShipping) {
      toast.error("Please select a shipping region");
      return;
    }

    try {
      setLoading(true);
      // Format phone number by removing +880 prefix if present
      const formattedPhone = formData.phone.replace(/^\+?880/, "");

      let couponData = null;
      if (appliedCoupon) {
        couponData = {
          couponId: appliedCoupon.couponId,
          code: appliedCoupon.code,
          productDiscountAmount: appliedCoupon.productDiscountAmount,
          shippingDiscountAmount: appliedCoupon.shippingDiscountAmount,
          finalPrice: appliedCoupon.finalPrice,
        };
      }

      // Create order
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cartId: cart._id,
            ...formData,
            phone: formattedPhone,
            paymentMethod: "Cash on Delivery",
            couponId: couponData?.couponId,
            couponCode: couponData?.code,
            productDiscountAmount: couponData?.productDiscountAmount || 0,
            shippingDiscountAmount: couponData?.shippingDiscountAmount || 0,
            finalPrice:
              couponData?.finalPrice ||
              cart.totalPrice +
                (shippingRates.find((r) => r.region === selectedShipping)
                  ?.cost || 0),
            shippingRegion: selectedShipping,
            isGift,
            giftNote,
          }),
        }
      );

      const orderData = await orderResponse.json();
      if (orderData.success) {
        toast.success("Order placed successfully!");
        await clearCart();
        await refetchCart();
        setOrderPlaced(true);
      } else {
        throw new Error(orderData.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  if (loading || cartLoading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!cart || !cart.items?.length) {
    return <LoadingSpinner fullPage={true} />;
  }

  const currentShippingRate =
    shippingRates.find((r) => r.region === selectedShipping)?.cost || 0;
  const subtotal = cart.totalPrice;
  const shippingCost = appliedCoupon?.finalShippingCost ?? currentShippingRate;
  const productDiscount = appliedCoupon?.productDiscountAmount || 0;
  const shippingDiscount = appliedCoupon?.shippingDiscountAmount || 0;
  const total = appliedCoupon?.finalPrice || subtotal + currentShippingRate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Enhanced Header with Gradient Styling */}
          <div className="mb-6 lg:mb-8">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Enhanced Background with Gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100/95 via-pink-100/90 to-purple-100/95 dark:from-slate-800/90 dark:via-slate-700/85 dark:to-indigo-900/90"></div>

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3 sm:gap-4 p-6 sm:p-8 lg:p-10">
                {/* Enhanced Icon with Gradient Background */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400/80 to-pink-500/70 dark:from-rose-600/40 dark:to-pink-500/30 rounded-xl lg:rounded-2xl blur-sm animate-pulse"></div>
                  <div className="relative p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/90 to-rose-100/80 dark:from-slate-700/80 dark:to-slate-600/70 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-rose-300/60 dark:border-rose-700/30 shadow-lg">
                    <FiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-rose-700 dark:text-rose-400 drop-shadow-sm" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Enhanced Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-800 dark:text-slate-200 mb-2 drop-shadow-sm tracking-tight">
                    <span className="bg-gradient-to-r from-rose-700 via-pink-700 to-purple-700 dark:from-slate-300 dark:via-rose-300 dark:to-pink-300 bg-clip-text text-transparent">
                      Checkout
                    </span>
                  </h1>

                  {/* Enhanced Subtitle */}
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 sm:w-10 lg:w-12 bg-gradient-to-r from-rose-500/90 via-pink-500/80 to-purple-500/70 dark:from-rose-500/60 dark:via-pink-500/50 dark:to-purple-500/40 rounded-full shadow-sm"></div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-semibold drop-shadow-sm">
                      Complete your order securely
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400/80 via-pink-400/70 via-purple-400/60 via-indigo-400/50 to-blue-400/40 dark:from-rose-600/40 dark:via-pink-600/30 dark:via-purple-600/25 dark:via-indigo-600/20 dark:to-blue-600/15"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Form */}
              <div className="xl:col-span-2 space-y-6">
                {/* Shipping Information */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20 border-b border-blue-100 dark:border-blue-800/30">
                    <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <FiMapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                        Shipping Information
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="street"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Street Address *
                        </Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              street: e.target.value,
                            }))
                          }
                          placeholder="Enter your street address"
                          required
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="Enter your city"
                          required
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="state"
                        className="text-slate-700 dark:text-slate-300 font-medium"
                      >
                        State *
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        placeholder="Enter your state"
                        required
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="addressDetails"
                        className="text-slate-700 dark:text-slate-300 font-medium"
                      >
                        Additional Address Details
                      </Label>
                      <Textarea
                        id="addressDetails"
                        value={formData.addressDetails}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            addressDetails: e.target.value,
                          }))
                        }
                        placeholder="Add any additional address details, landmarks, or delivery instructions"
                        rows={3}
                        maxLength={200}
                        className="resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.addressDetails.length}/200 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Phone Number *
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-md">
                            <FiPhone className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              +880
                            </span>
                          </div>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            placeholder="1234567890"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            disabled
                            className="rounded-l-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Email Address *
                        </Label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter your email"
                            required
                            className="pl-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gift Options */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 border-b border-purple-100 dark:border-purple-800/30">
                    <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
                        <FiGift className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                        Gift Options
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="giftOption"
                          checked={!isGift}
                          onChange={() => setIsGift(false)}
                          className="w-4 h-4 text-blue-600 border-2 border-slate-300 dark:border-slate-600 focus:ring-blue-500/20"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Buy for Self
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="giftOption"
                          checked={isGift}
                          onChange={() => setIsGift(true)}
                          className="w-4 h-4 text-purple-600 border-2 border-slate-300 dark:border-slate-600 focus:ring-purple-500/20"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Gift Someone
                        </span>
                      </label>
                    </div>

                    {isGift && (
                      <div className="space-y-2 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                        <Label
                          htmlFor="giftNote"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Gift Message
                        </Label>
                        <Textarea
                          id="giftNote"
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          placeholder="Add a personal message for the gift recipient"
                          rows={4}
                          maxLength={200}
                          className="resize-none bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-700"
                        />
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {giftNote.length}/200 characters
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 border-b border-green-100 dark:border-green-800/30">
                    <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                        <FiTruck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                        Shipping Method
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="shipping"
                        className="text-slate-700 dark:text-slate-300 font-medium"
                      >
                        Select Shipping Region *
                      </Label>
                      <select
                        id="shipping"
                        value={selectedShipping}
                        onChange={(e) => {
                          setSelectedShipping(e.target.value);
                          setAppliedCoupon(null); // Reset coupon when shipping changes
                        }}
                        required
                        className="w-full h-11 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400/20 dark:focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-slate-900 dark:text-slate-100"
                      >
                        {shippingRates.map((rate) => (
                          <option key={rate._id} value={rate.region}>
                            {rate.region} - ৳{rate.cost}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Coupon Section */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-400/20 dark:to-amber-400/20 border-b border-orange-100 dark:border-orange-800/30">
                    <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg shadow-md">
                        <FiTag className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                        Promo Code
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    {appliedCoupon ? (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-green-900 dark:text-green-100">
                                Coupon Applied: {appliedCoupon.code}
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                You saved ৳
                                {(
                                  appliedCoupon.productDiscountAmount +
                                  appliedCoupon.shippingDiscountAmount
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveCoupon}
                            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/20"
                          >
                            <FiX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Input
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          disabled={applying}
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={applying || !couponCode.trim()}
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md px-6"
                        >
                          {applying ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Applying...
                            </>
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="xl:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border-b border-indigo-100 dark:border-indigo-800/30">
                      <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
                          <FiCreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                          Order Summary
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                      {/* Order Items */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Items ({cart.items.length})
                        </h3>
                        <div className="max-h-48 overflow-y-auto space-y-3 scrollbar-thin">
                          {cart.items.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                ৳{item.cost.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                      {/* Price Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            Subtotal:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ৳{subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">
                            Shipping:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ৳{currentShippingRate.toFixed(2)}
                          </span>
                        </div>

                        {appliedCoupon &&
                          appliedCoupon.productDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span>Product Discount:</span>
                              <span className="font-semibold">
                                -৳
                                {appliedCoupon.productDiscountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}

                        {appliedCoupon &&
                          appliedCoupon.shippingDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span>Shipping Discount:</span>
                              <span className="font-semibold">
                                -৳
                                {appliedCoupon.shippingDiscountAmount.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}

                        <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Total:
                          </span>
                          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ৳{total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                      {/* Payment Method */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <FiCreditCard className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100">
                              Cash on Delivery
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Pay when you receive your order
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold"
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Placing Order...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
