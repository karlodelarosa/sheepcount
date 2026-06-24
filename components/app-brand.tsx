import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { BrandLogoIcon } from "@/components/brand-logo-icon";
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
      <BrandLogoIcon className={s.icon} iconClassName={s.iconInner} />
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
