"use client";

import { ReviewTable } from "@/features/admin/components/reviews/review-table";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Moderate reviews. Publish, hide, or flag reviews as needed.
        </p>
      </div>
      <ReviewTable />
    </div>
  );
}
