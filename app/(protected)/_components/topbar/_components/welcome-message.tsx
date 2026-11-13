"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/context/theme-context";
import { ChevronRight } from "lucide-react";

const routeTitles: Record<string, string> = {
  dashboard: "Dashboard",
  people: "People",
  workers: "Workers",
  households: "Households",
  leadership: "Leadership",
  "life-groups": "Life Groups",
  "cell-groups": "Cell Groups",
  "work-ministry": "Work Ministry",
  training: "Training",
  discipleship: "Discipleship",
  "bible-study": "Bible Studies",
  program: "Programs",
  "growth-track": "Growth Track",
  "service-attendance": "Service Attendance",
  "event-attendance": "Event Attendance",
  properties: "Properties",
  financial: "Financial",
  "goal-projects": "Fundraising Campaigns",
  "church-goals": "Vision & Themes",
  settings: "Settings",
  profile: "Profile",
  prospect: "Prospects",
  "audit-trail": "Audit Trail",
};

function getPageTitle(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return routeTitles[segment] ?? segment.replace(/-/g, " ");
}

export function WelcomeMessage() {
  const pathname = usePathname();
  const { settings } = useTheme();

  return (
    <div className="flex items-center gap-2 min-w-0">
      <SidebarTrigger className="lg:hidden h-7 w-7" />
      <div className="flex items-center gap-2 min-w-0 text-sm">
        <span className="font-medium text-foreground truncate">
          {getPageTitle(pathname)}
        </span>
        <ChevronRight
          className="hidden size-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden="true"
        />
        <span className="hidden truncate text-sm text-muted-foreground sm:inline">
          {settings.organizationName}
        </span>
      </div>
    </div>
  );
}
