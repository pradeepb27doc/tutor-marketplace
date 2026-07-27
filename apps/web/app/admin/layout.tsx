"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { UnauthorizedScreen } from "@/features/admin/components/unauthorized-screen";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const hasAdminRole =
      user?.roles?.includes("ADMIN") || user?.primaryRole === "ADMIN";
    setIsAdmin(hasAdminRole);
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isAdmin === false) {
    return <UnauthorizedScreen userRole={user?.primaryRole} />;
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Checking permissions...</p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
