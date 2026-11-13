import { PageSkeleton } from "@/components/page-skeleton";
import { Suspense } from "react";
import { LeadershipView } from ".";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeadershipView />
    </Suspense>
  );
}
