import { Suspense } from "react";
import { GrowthTrackView } from ".";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GrowthTrackView />
    </Suspense>
  );
}
