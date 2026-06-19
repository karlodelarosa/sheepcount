import { Suspense } from "react";
import { LeadershipView } from ".";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LeadershipView />
    </Suspense>
  );
}
