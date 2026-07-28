import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import BookingPageContent from "./booking-page-content";

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading booking" />}>
      <BookingPageContent />
    </Suspense>
  );
}
