import { Suspense } from "react";
import PaymentSuccessContent from "./payment-success-content";

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
