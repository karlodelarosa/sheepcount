import { Eye } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function AppBrand({
  className,
  showTagline = true,
  size = "md",
}: {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { icon: "w-6 h-6", iconInner: "w-3.5 h-3.5", title: "text-sm", tag: "text-[10px]" },
    md: { icon: "w-8 h-8", iconInner: "w-4 h-4", title: "text-lg", tag: "text-xs" },
    lg: { icon: "w-10 h-10", iconInner: "w-5 h-5", title: "text-2xl", tag: "text-sm" },
  };
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          s.icon,
          "rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 flex items-center justify-center shrink-0",
        )}
      >
        <Eye className={cn(s.iconInner, "text-white dark:text-slate-900")} />
      </div>
      <div className="min-w-0">
        <p className={cn(s.title, "font-semibold text-foreground leading-tight")}>
          {APP_NAME}
        </p>
        {showTagline && (
          <p className={cn(s.tag, "text-muted-foreground leading-tight")}>
            {APP_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );
}
