import { Suspense } from "react";
import PaymentPageContent from "./payment-page-content";

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentPageContent />
    </Suspense>
  );
}
