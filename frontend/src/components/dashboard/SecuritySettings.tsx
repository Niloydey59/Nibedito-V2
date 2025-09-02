"use client";

import { useState } from "react";
import { authService } from "@/services/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/common/Error";
import { FiLock, FiKey, FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordVisibilityState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function SecuritySettings(): React.JSX.Element {
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState<PasswordVisibilityState>({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (
    field: keyof PasswordVisibilityState
  ): void => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "New passwords do not match",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setStatus({
        type: "error",
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      setStatus({
        type: "success",
        message: "Password changed successfully",
      });
      setIsChangingPassword(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to change password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    setIsChangingPassword(false);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setStatus({ type: "", message: "" });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  return (
    <Card className="h-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-red-500/20 to-rose-500/20 dark:from-red-400/20 dark:to-rose-400/20 border-b border-red-100 dark:border-red-800/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg shadow-md">
            <FiLock className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Security Settings
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 lg:p-8">
        {status.message && (
          <Error type={status.type} message={status.message} className="mb-6" />
        )}

        {isChangingPassword ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Current Password */}
            <div className="space-y-3">
              <Label
                htmlFor="currentPassword"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20 dark:focus:ring-red-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced New Password */}
            <div className="space-y-3">
              <Label
                htmlFor="newPassword"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-green-400 dark:focus:border-green-500 focus:ring-green-400/20 dark:focus:ring-green-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Enhanced Confirm Password */}
            <div className="space-y-3">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-green-400 dark:focus:border-green-500 focus:ring-green-400/20 dark:focus:ring-green-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    <span className="text-white">Changing...</span>
                  </>
                ) : (
                  <span className="text-white">Change Password</span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-md">
                  <FiKey className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    Password
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Last changed:{" "}
                    <span className="text-orange-600 dark:text-orange-400">
                      Never updated
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span className="text-white">Change Password</span>
              </Button>
            </div>

            {/* Enhanced Security Tips */}
            <div className="p-5 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <FiLock className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Security Tips
                </h4>
              </div>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Use a strong, unique password
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Include uppercase, lowercase, numbers, and symbols
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Avoid using personal information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Change your password regularly
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
