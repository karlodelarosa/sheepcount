import { ThemeProvider } from "@/context/theme-context";
import { Toaster } from "@/components/ui/toast";
import { PeopleProvider } from "@/lib/people";
import { ServiceAttendanceProvider } from "@/lib/service-attendance";
import { EventsProvider } from "@/lib/events";
import { GroupsMinistryProvider } from "@/lib/groups-ministry";

/**
 * Phone-first shell for staff attendance capture.
 *
 * Deliberately does NOT reuse the desktop (protected) chrome (sidebar / topbar /
 * ml-52 layout). It wraps only the data providers the mobile flows touch. Auth +
 * organization membership are already enforced globally by middleware, so every
 * /mobile route is staff-only without any extra guarding here.
 */
export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <PeopleProvider>
        <ServiceAttendanceProvider>
          <GroupsMinistryProvider>
            <EventsProvider>
              <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-sm">
                  {children}
                </div>
              </div>
            </EventsProvider>
          </GroupsMinistryProvider>
        </ServiceAttendanceProvider>
      </PeopleProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
