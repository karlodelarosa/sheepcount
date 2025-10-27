import { TenantProvider } from "../providers/tenant-provider";
import { TopBar } from "./_components/topbar";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./_components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <TenantProvider>
          <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64">
              <TopBar />

              <main className="flex-1 p-8">
                <div className="max-w-[1400px] mx-auto">{children}</div>
              </main>
            </div>
          </div>
        </TenantProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
