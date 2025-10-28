"use client";

import { HouseholdDetails } from "../[id]/index";
import { useParams, useRouter } from "next/navigation";

export default function HouseholdDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    router.back();
  };

  if (!id) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: Household ID not found.
      </div>
    );
  }

  return <HouseholdDetails householdId={id} onBack={handleBack} />;
}
