"use client";

import Link from "next/link";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import React from "react";

type Props = {
  type?: string;
  message?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  action?: string | null;
};

export default function Error({
  type = "error",
  message,
  onClose,
  className = "",
  action = null,
}: Props) {
  if (!message) return null;

  return (
    <div className={`error-message ${type} ${className}`}>
      <div className="error-content">
        <span className="error-icon">
          {type === "success" ? (
            <FiCheckCircle size={20} />
          ) : (
            <FiAlertCircle size={20} />
          )}
        </span>
        <span>{message}</span>
      </div>

      <div
        className="error-actions"
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        {action && (
          <Link
            href={action}
            className="inline-flex items-center px-3 py-1 bg-rose-600 text-white rounded text-sm hover:opacity-90"
          >
            Take Action
          </Link>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="close-button ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close message"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
