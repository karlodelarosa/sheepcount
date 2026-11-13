import { PageSkeleton } from "@/components/page-skeleton";
import { Suspense } from "react";
import { GrowthTrackView } from ".";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GrowthTrackView />
    </Suspense>
  );
}
