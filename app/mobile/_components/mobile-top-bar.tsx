import { BrandLogoIcon } from "@/components/brand-logo-icon";
import { APP_NAME } from "@/lib/branding";
import { MobileThemeToggle } from "./mobile-theme-toggle";

/**
 * Slim branded bar shown at the top of the top-level mobile tab pages
 * (hub and browse) so they carry the Ministry Lens identity.
 */
export function MobileTopBar() {
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2.5 px-1">
        <BrandLogoIcon className="size-6" />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          {APP_NAME}
        </span>
      </div>
      <MobileThemeToggle />
    </div>
  );
}
