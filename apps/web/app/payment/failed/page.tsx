import { Suspense } from "react";
import PaymentFailedContent from "./payment-failed-content";

export default function PaymentFailedPage() {
  return (
    <Suspense>
      <PaymentFailedContent />
    </Suspense>
  );
}
