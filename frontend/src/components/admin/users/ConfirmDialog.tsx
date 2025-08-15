"use client";

import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType,
}) {
  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case "ban":
        return {
          color: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        };
      case "unban":
        return {
          color: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          iconColor: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
        };
      case "delete":
        return {
          color: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
        };
      default:
        return {
          color: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
        };
    }
  };

  const actionConfig = getActionConfig();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${actionConfig.bgColor} rounded-full flex items-center justify-center`}
                >
                  <FiAlertTriangle
                    className={`w-6 h-6 ${actionConfig.iconColor}`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${actionConfig.color}`}
            >
              Confirm{" "}
              {actionType === "ban"
                ? "Ban"
                : actionType === "unban"
                ? "Unban"
                : actionType === "delete"
                ? "Delete"
                : "Action"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
