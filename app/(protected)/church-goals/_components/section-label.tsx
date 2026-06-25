"use client";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
