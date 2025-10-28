"use client"

import { LifeGroupDetails } from ".";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LifeGroupDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    router.back();
  };

  if (!id) {
    return (
        <div className="p-8 space-y-4">
            <Button variant="outline" size="icon" onClick={handleBack} className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-center text-red-500">Error: Life Group ID not found.</div>
        </div>
    );
  }
  
  // Pass the ID and the back function to the new component
  return <LifeGroupDetails groupId={id} onBack={handleBack} />;
}