import { PageSkeleton } from "@/components/page-skeleton";
import { Suspense } from "react";
import { FinancialView } from ".";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FinancialView />
    </Suspense>
  );
}
