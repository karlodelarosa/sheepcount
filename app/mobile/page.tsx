import Link from "next/link";
import { Church, CalendarDays, UsersRound, ChevronRight } from "lucide-react";
import { MobileTabBar } from "./_components/mobile-tab-bar";
import { MobileTopBar } from "./_components/mobile-top-bar";

const FLOWS = [
  {
    href: "/mobile/service",
    title: "Service Attendance",
    description: "Sunday worship & gatherings",
    icon: Church,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/mobile/life-group",
    title: "Life Group",
    description: "Record a group meeting",
    icon: UsersRound,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/mobile/event",
    title: "Event Attendance",
    description: "Check people into an event",
    icon: CalendarDays,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
] as const;

export default function MobileHubPage() {
  return (
    <>
      <MobileTopBar />

      <header className="border-b px-5 py-5">
        <h1 className="text-xl font-semibold">Record Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Choose what you&apos;re recording
        </p>
      </header>

      <main className="flex-1 space-y-3 px-4 py-5 pb-24">
        {FLOWS.map(flow => {
          const Icon = flow.icon;
          return (
            <Link
              key={flow.href}
              href={flow.href}
              className="flex items-center gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm transition-colors hover:bg-muted/50 active:scale-[0.99]"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${flow.accent}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">
                  {flow.title}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {flow.description}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </main>

      <MobileTabBar />
    </>
  );
}
