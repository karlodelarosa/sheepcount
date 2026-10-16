import Link from "next/link";
import {
  BookOpenText,
  Church,
  CalendarDays,
  UsersRound,
  Sprout,
  ChevronRight,
} from "lucide-react";
import { MobileTabBar } from "./_components/mobile-tab-bar";
import { MobileTopBar } from "./_components/mobile-top-bar";
import { MobilePageHeader } from "./_components/mobile-page-header";

const FLOWS = [
  {
    href: "/mobile/service",
    title: "Service Attendance",
    description: "Sunday worship & gatherings",
    icon: Church,
  },
  {
    href: "/mobile/life-group",
    title: "Life Group",
    description: "Record a group meeting",
    icon: UsersRound,
  },
  {
    href: "/mobile/cell-group",
    title: "Cell Group",
    description: "Record a feeder-course meeting",
    icon: Sprout,
  },
  {
    href: "/mobile/discipleship",
    title: "Discipleship",
    description: "Log a meeting or prayer request",
    icon: BookOpenText,
  },
  {
    href: "/mobile/event",
    title: "Event Attendance",
    description: "Check people into an event",
    icon: CalendarDays,
  },
] as const;

export default function MobileHubPage() {
  return (
    <>
      <MobileTopBar />

      <MobilePageHeader
        title="Record attendance"
        subtitle="Choose what you’re recording"
      />

      <main className="flex-1 px-4 pb-28 pt-1">
        <div className="overflow-hidden rounded-[20px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
          {FLOWS.map((flow, index) => {
            const Icon = flow.icon;
            return (
              <Link
                key={flow.href}
                href={flow.href}
                className="group flex min-h-20 items-center gap-3.5 px-4 text-left transition-colors duration-200 hover:bg-muted/60 active:bg-muted motion-reduce:transition-none"
              >
                <span className="flex w-8 shrink-0 items-center justify-center text-foreground">
                  <Icon className="size-[25px]" strokeWidth={1.8} />
                </span>
                <span
                  className={`flex min-w-0 flex-1 items-center gap-3.5 self-stretch ${
                    index < FLOWS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 py-3">
                    <span className="block text-[17px] font-medium leading-5 tracking-[-0.012em]">
                      {flow.title}
                    </span>
                    <span className="mt-1 block text-[14px] leading-[18px] text-muted-foreground">
                      {flow.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="mr-0.5 size-5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-active:translate-x-0.5 motion-reduce:transition-none"
                    strokeWidth={1.8}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      <MobileTabBar />
    </>
  );
}
