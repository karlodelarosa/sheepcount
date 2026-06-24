import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogoIcon({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center shrink-0",
        className,
      )}
      style={{
        background:
          "linear-gradient(to bottom right, var(--accent-color), var(--accent-color-muted))",
      }}
    >
      <Eye
        className={cn(iconClassName)}
        style={{ color: "var(--accent-color-foreground)" }}
      />
    </div>
  );
}
