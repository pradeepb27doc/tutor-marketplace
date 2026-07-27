"use client";

import { ShieldXIcon } from "lucide-react";
import Link from "next/link";

interface UnauthorizedScreenProps {
  userRole?: string;
}

export function UnauthorizedScreen({ userRole }: UnauthorizedScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <ShieldXIcon className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-3 text-sm text-gray-600">
          You do not have permission to access the admin dashboard.
        </p>
        {userRole && (
          <p className="mt-1 text-xs text-gray-500">
            Your current role: <strong>{userRole}</strong>
          </p>
        )}
        <p className="mt-4 text-xs text-gray-500">
          If you believe this is an error, please contact your system administrator.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
