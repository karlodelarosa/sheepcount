import { WorkersView } from ".";
import { WorkerOnboardingProvider } from "@/lib/worker-onboarding-context";

export default function Page() {
  return (
    <WorkerOnboardingProvider>
      <WorkersView />
    </WorkerOnboardingProvider>
  );
}
