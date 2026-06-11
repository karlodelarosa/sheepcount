"use client";

import { cn } from "@/lib/utils";
import { AppBrand } from "@/components/app-brand";

type PageLoaderProps = {
  message?: string;
  className?: string;
  fullScreen?: boolean;
};

export function PageLoader({
  message = "Loading...",
  className,
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 px-6",
        fullScreen ? "min-h-screen w-full" : "py-20 w-full",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <AppBrand size="lg" className="opacity-95" />

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-border/80" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground border-r-foreground/30" />
          <div className="h-2 w-2 rounded-full bg-foreground/80 animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
