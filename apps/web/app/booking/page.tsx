import { Suspense } from "react";
import BookingPageContent from "./booking-page-content";

export default function BookingPage() {
  return (
    <Suspense>
      <BookingPageContent />
    </Suspense>
  );
}
