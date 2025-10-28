"use client";

import { PersonDetails } from "../[id]/index";
import { useParams, useRouter } from "next/navigation";

export default function PersonDetailsPage() {
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
