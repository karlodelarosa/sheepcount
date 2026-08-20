import { AppBrand } from "@/components/app-brand";

/**
 * Slim branded bar shown at the top of the top-level mobile tab pages
 * (hub and browse) so they carry the Ministry Lens identity.
 */
export function MobileTopBar() {
  return (
    <div className="flex items-center border-b bg-card px-4 py-3">
      <AppBrand size="sm" showTagline={false} />
    </div>
  );
}
