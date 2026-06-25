"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalProjectDetails } from ".";

export default function GoalProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    router.push("/goal-projects");
  };

  if (!id) {
    return (
      <div className="p-8 space-y-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center text-red-500">
          Error: Campaign ID not found.
        </div>
      </div>
    );
  }

  return <GoalProjectDetails campaignId={id} onBack={handleBack} />;
}

