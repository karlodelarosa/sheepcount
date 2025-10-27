import { FC } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { TenantMembership } from "@/components/login-form";

export type WelcomMessageProps = {
  profile: TenantMembership["profile"];
};

const WelcomeMessage: FC<WelcomMessageProps> = ({ profile }) => {
  const { first_name, last_name } = profile;

  return (
    <div className="flex items-center gap-4">
      <SidebarTrigger className="lg:hidden" />
      <div>
        <h1 className="text-foreground">Welcome back, {first_name}</h1>
        <p className="text-muted-foreground">
          Manage your organization efficiently
        </p>
      </div>
    </div>
  );
};

export { WelcomeMessage };
