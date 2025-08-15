"use client";

import AdminNavbar from "@/components/admin/common/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <main className="admin-main">{children}</main>
    </div>
  );
}
