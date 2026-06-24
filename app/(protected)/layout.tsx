import { PageTransition } from "@/components/page-transition";
import { TopBar } from "./_components/topbar";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./_components/sidebar";
import { Toaster } from "@/components/ui/toast";
import { GroupsMinistryProvider } from "@/lib/groups-ministry";
import { DiscipleshipProvider } from "@/lib/discipleship";
import { TrainingProvider } from "@/lib/training";
import { EventsProvider } from "@/lib/events";
import { BibleStudyProvider } from "@/lib/bible-study";
import { LeadershipProvider } from "@/lib/leadership";
import { GrowthTrackProvider } from "@/lib/growth-track";
import { OrganizationSettingsProvider } from "@/lib/organization-settings";
import { BaptismProvider } from "@/lib/baptism";
import { PeopleProvider } from "@/lib/people";
import { ServiceAttendanceProvider } from "@/lib/service-attendance";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <OrganizationSettingsProvider>
          <PeopleProvider>
            <BaptismProvider>
              <GroupsMinistryProvider>
                <DiscipleshipProvider>
                  <ServiceAttendanceProvider>
                    <GrowthTrackProvider>
                      <EventsProvider>
                        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                          <Sidebar />

                          <div className="flex-1 flex flex-col ml-52 min-w-0">
                            <TopBar />

                            <main className="flex-1 p-4">
                              <div className="max-w-[1600px] mx-auto">
                                <TrainingProvider>
                                  <BibleStudyProvider>
                                    <LeadershipProvider>
                                      <PageTransition>{children}</PageTransition>
                                    </LeadershipProvider>
                                  </BibleStudyProvider>
                                </TrainingProvider>
                              </div>
                            </main>
                          </div>
                        </div>
                      </EventsProvider>
                    </GrowthTrackProvider>
                  </ServiceAttendanceProvider>
                </DiscipleshipProvider>
              </GroupsMinistryProvider>
            </BaptismProvider>
          </PeopleProvider>
        </OrganizationSettingsProvider>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </ThemeProvider>
  );
}
