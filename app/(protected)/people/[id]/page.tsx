"use client";

import { Suspense } from "react";
import { PersonDetails } from "../[id]/index";
import { useParams, useRouter } from "next/navigation";

function PersonDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    router.back();
  };

  if (!id) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: Person ID not found.
      </div>
    );
  }

  return <PersonDetails personId={id} onBack={handleBack} />;
}

export default function PersonDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PersonDetailsPageContent />
    </Suspense>
  );
}
