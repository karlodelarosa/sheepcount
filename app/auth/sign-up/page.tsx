import Link from "next/link";
import { AppBrand } from "@/components/app-brand";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6 text-center">
        <AppBrand size="lg" className="justify-center" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Accounts are provisioned by us</h1>
          <p className="text-sm text-muted-foreground">
            Ministry Lens is invite-only. Contact your administrator if you need
            access to your church account.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-block text-sm font-medium underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
