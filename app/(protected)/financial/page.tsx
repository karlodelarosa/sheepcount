import { Suspense } from "react";
import { FinancialView } from ".";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FinancialView />
    </Suspense>
  );
}
