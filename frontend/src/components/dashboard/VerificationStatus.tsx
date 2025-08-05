"use client";

import { useState } from "react";
import { authService } from "@/services/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Error from "@/components/common/Error";
import {
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiShield,
} from "react-icons/fi";

export default function VerificationStatus({ user }) {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await authService.resendVerificationEmail(user.email);
      setStatus({
        type: "success",
        message: "Verification email has been sent. Please check your inbox.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send verification email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-400/20 dark:to-green-400/20 border-b border-emerald-100 dark:border-emerald-800/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-md">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Verification Status
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {status.message && (
          <Error type={status.type} message={status.message} className="mb-4" />
        )}

        <div className="space-y-5">
          {/* Enhanced Email Verification */}
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FiMail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  Email Status
                </h3>
                <Badge
                  variant={
                    user.verificationStatus.email ? "default" : "secondary"
                  }
                  className={`gap-1 px-3 py-1 font-medium ${
                    user.verificationStatus.email
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md"
                  }`}
                >
                  {user.verificationStatus.email ? (
                    <>
                      <FiCheckCircle className="w-3 h-3" />
                      Verified
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4 truncate font-medium">
                {user.email}
              </p>
              {!user.verificationStatus.email && (
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Phone Verification */}
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
              <FiPhone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  Phone Status
                </h3>
                <Badge
                  variant={
                    user.verificationStatus.phone ? "default" : "secondary"
                  }
                  className={`gap-1 px-3 py-1 font-medium ${
                    user.verificationStatus.phone
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md"
                  }`}
                >
                  {user.verificationStatus.phone ? (
                    <>
                      <FiCheckCircle className="w-3 h-3" />
                      Verified
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">
                +880{user.phone}
              </p>
              {!user.verificationStatus.phone && (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                  Phone verification coming soon
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Verification Benefits */}
        {(!user.verificationStatus.email || !user.verificationStatus.phone) && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Why verify your account?
              </h4>
            </div>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2 ml-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Enhanced account security
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Access to exclusive features
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Priority customer support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Order and shipping updates
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
