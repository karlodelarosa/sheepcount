"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { hasFeature } from "@/lib/subscription/entitlements";
import { cn } from "@/lib/utils";

export function AuditTrailButton() {
  const { entitlements } = useEntitlements();

  if (!hasFeature({ features: entitlements.features }, "audit_trail")) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 rounded-lg",
        "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900",
        "dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900/70",
      )}
      asChild
    >
      <Link href="/audit-trail" aria-label="Audit trail">
        <History className="h-3.5 w-3.5" />
      </Link>
    </Button>
  );
}
