import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import PaymentPageContent from "./payment-page-content";

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading payment" />}>
      <PaymentPageContent />
    </Suspense>
  );
}
