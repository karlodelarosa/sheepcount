import { Suspense } from "react";
import { PeopleDirectory } from "./_components/people-directory";

export function PeopleList() {
  return (
    <Suspense fallback={null}>
      <PeopleDirectory />
    </Suspense>
  );
}
