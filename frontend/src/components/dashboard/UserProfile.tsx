"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiCamera, FiEdit2, FiPlus, FiMapPin } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import Error from "@/components/common/Error";
import userService from "@/services/userService";
import { uploadImage, getImageUrl } from "@/utils/imageUtils";
import axios from "@/utils/axios";

export default function UserProfile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses?.[0]?._id || ""
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    phone: initialUser?.phone || "",
  });
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      // Set the selected address to the default address if it exists
      const defaultAddress = user.addresses?.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (user.addresses?.[0]) {
        setSelectedAddressId(user.addresses[0]._id);
      }
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Please upload a valid image file (JPEG, PNG, or WebP)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setStatus({
        type: "error",
        message: "Image size should be less than 5MB",
      });
      return;
    }

    try {
      setIsUploading(true);
      setStatus({ type: "", message: "" });

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.put(
        `${API_URL}/users/profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload image");
      }

      // Update local user state and localStorage
      setUser(response.data.payload.user);
      localStorage.setItem("user", JSON.stringify(response.data.payload.user));

      setStatus({
        type: "success",
        message: "Profile picture updated successfully",
      });
    } catch (err) {
      console.error("Profile picture upload error:", err);
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSelect = (e) => {
    setSelectedAddressId(e.target.value);
  };

  const handleEditAddress = () => {
    const selectedAddress = user.addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (selectedAddress) {
      setAddressFormData({
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        isDefault: selectedAddress.isDefault,
      });
      setShowAddressForm(true);
    }
  };

  const handleAddNewAddress = () => {
    setAddressFormData({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
    });
    setSelectedAddressId(""); // Clear selected address when adding new
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let updatedUser;
      if (showAddressForm) {
        if (selectedAddressId) {
          // Update existing address
          updatedUser = await userService.updateAddress(
            user._id,
            selectedAddressId,
            addressFormData
          );
        } else {
          // Add new address
          updatedUser = await userService.addAddress(user._id, addressFormData);

          // If this is the first address or isDefault is true, update UI accordingly
          if (!user.addresses?.length || addressFormData.isDefault) {
            const newAddress =
              updatedUser.addresses[updatedUser.addresses.length - 1];
            setSelectedAddressId(newAddress._id);
          }
        }
        setShowAddressForm(false);
      } else if (selectedAddressId) {
        // Just updating default status
        const selectedAddress = user.addresses.find(
          (addr) => addr._id === selectedAddressId
        );
        if (selectedAddress) {
          updatedUser = await userService.updateAddress(
            user._id,
            selectedAddressId,
            {
              ...selectedAddress,
              isDefault: true,
            }
          );
        }
      }

      if (updatedUser) {
        setStatus({
          type: "success",
          message: selectedAddressId
            ? "Address updated successfully"
            : "New address added successfully",
        });
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // If no address was previously selected, select the newly added one
        if (!selectedAddressId && updatedUser.addresses?.length > 0) {
          const newAddress =
            updatedUser.addresses[updatedUser.addresses.length - 1];
          setSelectedAddressId(newAddress._id);
        }
      }
    } catch (error) {
      console.error("Address update error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update address",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const updatedUser = await userService.updateProfile(user._id, {
        name: formData.name,
        phone: formData.phone,
      });

      setStatus({
        type: "success",
        message: "Profile updated successfully",
      });
      setIsEditing(false);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
    return address.isDefault ? `${fullAddress} (Default)` : fullAddress;
  };

  if (isLoading || !formData) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-muted-foreground">
              Loading profile data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 border-b border-blue-100 dark:border-blue-800/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <FiEdit2 className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Profile Information
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {status.message && (
          <Error type={status.type} message={status.message} className="mb-4" />
        )}

        {/* Enhanced Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div
              className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30"
              onClick={handleImageClick}
            >
              {user.profilePicture ? (
                <Image
                  src={getImageUrl(user.profilePicture)}
                  alt={user.name}
                  fill
                  className="object-cover"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <FiCamera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {isUploading && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant="outline"
                  className="text-xs bg-white dark:bg-slate-800 shadow-md"
                >
                  <Spinner size="sm" className="mr-1" />
                  Uploading...
                </Badge>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {user.name}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {user.email}
            </p>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

        {/* Enhanced Profile Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="transition-all duration-200 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="phone"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Phone Number
              </Label>
              <div className="flex">
                <div className="flex items-center px-4 bg-slate-100 dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-md">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    +880
                  </span>
                </div>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={10}
                  placeholder="1234567890"
                  className="rounded-l-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Address Section */}
          <div className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded">
                <FiMapPin className="w-4 h-4 text-white" />
              </div>
              Delivery Address
            </Label>
            <div className="flex gap-3">
              <select
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="flex-1 h-11 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                disabled={!user.addresses?.length}
              >
                {user.addresses?.length ? (
                  user.addresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {formatAddress(address)}
                    </option>
                  ))
                ) : (
                  <option value="">No addresses added</option>
                )}
              </select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleEditAddress}
                disabled={!selectedAddressId}
                title="Edit selected address"
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              >
                <FiEdit2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddNewAddress}
                title="Add new address"
                className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white hover:from-green-600 hover:to-emerald-700 shadow-md"
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Address Form */}
          {showAddressForm && (
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                  {selectedAddressId ? "Edit Address" : "Add New Address"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="street"
                    className="text-slate-700 dark:text-slate-300 font-medium"
                  >
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    value={addressFormData.street}
                    onChange={handleAddressChange}
                    placeholder="Enter your street address"
                    required
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label
                      htmlFor="city"
                      className="text-slate-700 dark:text-slate-300 font-medium"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={addressFormData.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      required
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="state"
                      className="text-slate-700 dark:text-slate-300 font-medium"
                    >
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={addressFormData.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      required
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="postalCode"
                      className="text-slate-700 dark:text-slate-300 font-medium"
                    >
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={addressFormData.postalCode}
                      onChange={handleAddressChange}
                      placeholder="Postal Code"
                      required
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={(e) =>
                      setAddressFormData((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500/20"
                  />
                  <Label
                    htmlFor="isDefault"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Set as default address
                  </Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleAddressSubmit}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        {selectedAddressId ? "Updating..." : "Adding..."}
                      </>
                    ) : selectedAddressId ? (
                      "Update Address"
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  <span className="text-white">Saving...</span>
                </>
              ) : isEditing ? (
                <span className="text-white">Save Changes</span>
              ) : (
                <span className="text-white">Edit Profile</span>
              )}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || "",
                    phone: user.phone || "",
                  });
                }}
                className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
