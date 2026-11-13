import { PageSkeleton } from "@/components/page-skeleton";
import { Suspense } from "react";
import { PeopleDirectory } from "./_components/people-directory";

export function PeopleList() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PeopleDirectory />
    </Suspense>
  );
}
