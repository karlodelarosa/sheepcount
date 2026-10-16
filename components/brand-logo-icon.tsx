import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogoIcon({
  className,
  variant = "auto",
}: {
  className?: string;
  // Kept for backwards compatibility with existing callers. The new logo is
  // a complete image, so it no longer has a separately sized inner glyph.
  iconClassName?: string;
  variant?: "auto" | "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-lg",
        className,
      )}
    >
      {variant !== "dark" && (
        <Image
          src="/images/ml-logo.png"
          alt=""
          width={64}
          height={64}
          className={cn(
            "size-full object-cover",
            variant === "auto" && "dark:hidden",
          )}
        />
      )}
      {variant !== "light" && (
        <Image
          src="/images/ml-logo-inverted.png"
          alt=""
          width={64}
          height={64}
          className={cn(
            "size-full object-cover",
            variant === "auto" && "hidden dark:block",
          )}
        />
      )}
    </span>
  );
}
