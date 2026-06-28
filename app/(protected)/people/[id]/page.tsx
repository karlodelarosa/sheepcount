"use client";

import { Suspense } from "react";
import { PersonDetails } from "../[id]/index";
import { useParams, useRouter } from "next/navigation";
import { loadPeopleListNavigation } from "../_lib/list-state";

function PersonDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    const nav = loadPeopleListNavigation();
    if (nav?.returnQuery) {
      router.push(`/people?${nav.returnQuery}`);
      return;
    }
    router.back();
  };

  const handleNavigateToPerson = (nextPersonId: string) => {
    router.push(`/people/${nextPersonId}`);
  };

  if (!id) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: Person ID not found.
      </div>
    );
  }

  return (
    <PersonDetails
      personId={id}
      onBack={handleBack}
      onNavigateToPerson={handleNavigateToPerson}
    />
  );
}

export default function PersonDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PersonDetailsPageContent />
    </Suspense>
  );
}
