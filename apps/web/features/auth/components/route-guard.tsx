"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/common/loading-state";
import { AppErrorState } from "@/components/common/error-state";
import { useAuth } from "./auth-provider";

type RequiredRole = "PARENT" | "TUTOR" | "ADMIN";

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: RequiredRole;
  fallbackHref?: string;
}

function hasRole(user: ReturnType<typeof useAuth>["user"], role?: RequiredRole) {
  if (!role) return true;
  return user?.primaryRole === role || user?.roles?.includes(role) === true;
}

export function RouteGuard({ children, requiredRole, fallbackHref = "/" }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    const returnTo = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${returnTo}`);
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <LoadingState label="Checking authentication" />;
  }

  if (!isAuthenticated) {
    return <LoadingState label="Redirecting to login" />;
  }

  if (!hasRole(user, requiredRole)) {
    return (
      <AppErrorState
        title="Not authorized"
        message={
          requiredRole
            ? `This page is available only for ${requiredRole.toLowerCase()} accounts.`
            : "You do not have permission to view this page."
        }
        homeHref={fallbackHref}
      />
    );
  }

  return children;
}