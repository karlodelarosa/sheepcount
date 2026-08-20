import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/context/theme-context";
import { Toaster } from "@/components/ui/toast";
import { PeopleProvider } from "@/lib/people";
import { ServiceAttendanceProvider } from "@/lib/service-attendance";
import { EventsProvider } from "@/lib/events";
import { GroupsMinistryProvider } from "@/lib/groups-ministry";
import { DiscipleshipProvider } from "@/lib/discipleship";
import { GrowthTrackProvider } from "@/lib/growth-track";
import { RegisterServiceWorker } from "@/app/register-sw";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ministry Lens",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

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
            <DiscipleshipProvider>
              <GrowthTrackProvider>
                <EventsProvider>
                  <RegisterServiceWorker />
                  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-sm">
                      {children}
                    </div>
                  </div>
                </EventsProvider>
              </GrowthTrackProvider>
            </DiscipleshipProvider>
          </GroupsMinistryProvider>
        </ServiceAttendanceProvider>
      </PeopleProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
