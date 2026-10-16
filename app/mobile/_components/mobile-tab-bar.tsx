"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquarePen, ClipboardList, House, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  // Hard navigation: /mobile/desktop is a route handler that sets the
  // desktop opt-out cookie and redirects into the full desktop app.
  { href: "/mobile/desktop", label: "Home", icon: House, hard: true },
  {
    href: "/mobile/shepherding",
    label: "Shepherd",
    icon: HeartHandshake,
    hard: false,
  },
  { href: "/mobile", label: "Record", icon: SquarePen, hard: false },
  { href: "/mobile/browse", label: "Browse", icon: ClipboardList, hard: false },
] as const;

/**
 * Persistent bottom navigation for the top-level mobile tabs.
 * Only rendered on the hub and browse pages — the individual record flows use
 * their own sticky action bar instead, so the two never overlap.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-[26.5rem] items-stretch justify-around rounded-[22px] border border-black/[0.06] bg-card/90 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/[0.1] supports-[backdrop-filter]:bg-card/82">
        {TABS.map(tab => {
          const active =
            !tab.hard &&
            (tab.href === "/mobile"
              ? pathname === "/mobile"
              : pathname.startsWith(tab.href));
          const Icon = tab.icon;
          const className = cn(
            "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-colors duration-200 motion-reduce:transition-none",
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          );
          const content = (
            <>
              <Icon className="size-6" strokeWidth={active ? 2.1 : 1.75} />
              <span className="text-[11px] font-medium leading-none tracking-[-0.01em]">
                {tab.label}
              </span>
            </>
          );

          return tab.hard ? (
            <a key={tab.href} href={tab.href} className={className}>
              {content}
            </a>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
