"use client";

import { GroupDetails } from ".";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DiscipleshipGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const handleBack = () => {
    router.push("/discipleship?tab=groups");
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
          Error: Group ID not found.
        </div>
      </div>
    );
  }

  return <GroupDetails groupId={id} onBack={handleBack} />;
}
