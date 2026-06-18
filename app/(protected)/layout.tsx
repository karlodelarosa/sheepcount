import { TopBar } from "./_components/topbar";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./_components/sidebar";
import { Toaster } from "@/components/ui/toast";
import { GroupsMinistryProvider } from "@/lib/groups-ministry";
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
        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <Sidebar />

          <div className="flex-1 flex flex-col ml-52 min-w-0">
            <TopBar />

            <main className="flex-1 p-4">
              <div className="max-w-[1600px] mx-auto">
                <PeopleProvider>
                  <GroupsMinistryProvider>
                    <ServiceAttendanceProvider>{children}</ServiceAttendanceProvider>
                  </GroupsMinistryProvider>
                </PeopleProvider>
              </div>
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </ThemeProvider>
  );
}
