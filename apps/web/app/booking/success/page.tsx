import { Suspense } from "react";
import BookingSuccessContent from "./booking-success-content";

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <BookingSuccessContent />
    </Suspense>
  );
}
