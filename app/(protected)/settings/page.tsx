import { Suspense } from "react";
import { PageLoader } from "@/components/page-loader";
import { SettingsView } from ".";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading settings..." />}>
      <SettingsView />
    </Suspense>
  );
}
