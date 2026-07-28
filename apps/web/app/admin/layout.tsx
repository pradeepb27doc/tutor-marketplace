"use client";

import type { ReactNode } from "react";
import { RouteGuard } from "@/features/auth/components/route-guard";
import { AdminLayout } from "@/features/admin/components/admin-layout";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="ADMIN" fallbackHref="/dashboard">
      <AdminLayout>{children}</AdminLayout>
    </RouteGuard>
  );
}
