"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  HeartHandshake,
  UserPlus,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Person } from "@/lib/people";
import type { ShepherdItem } from "@/lib/shepherding";
import type { UpcomingBirthday } from "../_lib/dashboard-actions";
import {
  ATTENTION_EXPANDED_STORAGE_KEY,
  readAttentionExpanded,
} from "../_lib/dashboard-preferences";

type CareCategoryId = "shepherd" | "assimilate" | "follow-ups" | "reminders";

type ActionRow = {
  key: string;
  name: string;
  context: string;
  href: string;
  tag?: string;
};

type CareCategory = {
  id: CareCategoryId;
  label: string;
  heading: string;
  description: string;
  icon: typeof HeartHandshake;
  rows: ActionRow[];
  viewAllHref: string;
  emptyLabel: string;
};

interface ActionCenterProps {
  shepherd: ShepherdItem[];
  assimilateContacts: ShepherdItem[];
  unassignedNewMembers: Person[];
  followUps: ShepherdItem[];
  unrecordedSundayLabel: string | null;
  upcomingBirthdays: UpcomingBirthday[];
}

const MAX_ROWS = 4;

function toShepherdRow(item: ShepherdItem): ActionRow {
  return {
    key: item.person.id,
    name: item.person.name,
    context: item.status.description,
    href: `/people/${item.person.id}`,
    tag: item.status.label,
  };
}

function CategoryPanel({ category }: { category: CareCategory }) {
  const visibleRows = category.rows.slice(0, MAX_ROWS);

  return (
    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground">
            {category.heading}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {category.description}
          </p>
        </div>
        {category.rows.length > 0 ? (
          <Link
            href={category.viewAllHref}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] motion-reduce:transition-none"
          >
            View all ({category.rows.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      {visibleRows.length > 0 ? (
        <ul className="divide-y divide-border" role="list">
          {visibleRows.map(row => (
            <li key={row.key}>
              <Link
                href={row.href}
                className="group grid min-h-12 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1.5 py-1.5 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)] motion-reduce:transition-none"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-color-soft)] text-xs font-bold text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                  {row.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {row.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {row.context}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {row.tag ? (
                    <span className="hidden max-w-40 truncate rounded-full bg-[var(--accent-color-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-color-strong)] sm:block dark:text-[var(--accent-color)]">
                      {row.tag}
                    </span>
                  ) : null}
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-20 items-center gap-3 rounded-xl border border-dashed border-border bg-muted/25 px-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{category.emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

export function ActionCenter({
  shepherd,
  assimilateContacts,
  unassignedNewMembers,
  followUps,
  unrecordedSundayLabel,
  upcomingBirthdays,
}: ActionCenterProps) {
  const categories = useMemo<CareCategory[]>(() => {
    const assimilateRows: ActionRow[] = [
      ...assimilateContacts.map(item => ({
        key: item.person.id,
        name: item.person.name,
        context: "First-time attendee who needs a personal welcome.",
        href: `/people/${item.person.id}`,
        tag: "Needs contact",
      })),
      ...unassignedNewMembers.map(person => ({
        key: person.id,
        name: person.name,
        context: "New member who has not joined a life group.",
        href: `/people/${person.id}`,
        tag: "Needs a group",
      })),
    ];
    const reminderRows: ActionRow[] = [
      ...(unrecordedSundayLabel
        ? [
            {
              key: `attendance-${unrecordedSundayLabel}`,
              name: `Record ${unrecordedSundayLabel} attendance`,
              context: "No Sunday service session has been logged yet.",
              href: "/service-attendance",
              tag: "Attendance",
            },
          ]
        : []),
      ...upcomingBirthdays.map(entry => ({
        key: entry.person.id,
        name: entry.person.name,
        context: entry.person.householdName || "Upcoming birthday",
        href: `/people/${entry.person.id}`,
        tag:
          entry.inDays === 0
            ? "Today"
            : entry.inDays === 1
              ? "Tomorrow"
              : `In ${entry.inDays} days`,
      })),
    ];

    return [
      {
        id: "shepherd",
        label: "To Shepherd",
        heading: "People needing reconnection",
        description: "Members whose recent attendance signals a need for care.",
        icon: HeartHandshake,
        rows: shepherd.map(toShepherdRow),
        viewAllHref: "/people",
        emptyLabel: "No one currently needs attendance-based reconnection.",
      },
      {
        id: "assimilate",
        label: "To Assimilate",
        heading: "People ready to connect",
        description: "New attendees and members who need a next connection.",
        icon: UserPlus,
        rows: assimilateRows,
        viewAllHref: "/growth-track",
        emptyLabel: "Everyone new currently has a clear connection path.",
      },
      {
        id: "follow-ups",
        label: "Follow-ups",
        heading: "Follow-ups awaiting action",
        description: "People with an outstanding growth-track follow-up.",
        icon: ClipboardList,
        rows: followUps.map(toShepherdRow),
        viewAllHref: "/growth-track",
        emptyLabel: "There are no outstanding follow-ups.",
      },
      {
        id: "reminders",
        label: "Reminders",
        heading: "This week's reminders",
        description: "Timely attendance tasks and pastoral moments.",
        icon: Bell,
        rows: reminderRows,
        viewAllHref: "/service-attendance",
        emptyLabel: "There are no reminders for this week.",
      },
    ];
  }, [
    assimilateContacts,
    followUps,
    shepherd,
    unassignedNewMembers,
    unrecordedSundayLabel,
    upcomingBirthdays,
  ]);

  const totalActions = categories.reduce(
    (total, category) => total + category.rows.length,
    0,
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(readAttentionExpanded(window.localStorage));
  }, []);

  function handleValueChange(value: string) {
    const nextExpanded = value === "care-actions";
    setExpanded(nextExpanded);
    try {
      window.localStorage.setItem(
        ATTENTION_EXPANDED_STORAGE_KEY,
        nextExpanded ? "expanded" : "collapsed",
      );
    } catch {
      // Storage can be unavailable; the control still works for this session.
    }
  }

  return (
    <section aria-labelledby="ministry-care-heading">
      <Accordion
        type="single"
        collapsible
        value={expanded ? "care-actions" : ""}
        onValueChange={handleValueChange}
        className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:shadow-none"
      >
        <AccordionItem value="care-actions" className="border-0">
          <AccordionTrigger className="items-center gap-4 rounded-none px-4 py-3.5 hover:no-underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)] sm:px-5 [&>svg]:mt-0 [&>svg]:text-foreground">
            <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
              <div className="flex min-w-0 items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      id="ministry-care-heading"
                      className="truncate text-base font-bold tracking-[-0.025em] text-foreground"
                    >
                      Ministry Care &amp; Actions
                    </span>
                    <span className="rounded-full bg-[var(--accent-color-soft)] px-2 py-0.5 text-xs font-bold tabular-nums text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                      {totalActions}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                    People and tasks that need your attention.
                  </span>
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pl-[3.25rem] sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:pl-[3.25rem] xl:pl-0">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <dt className="font-medium text-muted-foreground">
                        {category.label}
                      </dt>
                      <dd className="rounded-full bg-muted px-2 py-0.5 font-bold tabular-nums text-foreground">
                        {category.rows.length}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </AccordionTrigger>

          <AccordionContent className="border-t border-border motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none [&>div]:pb-0">
            <Tabs defaultValue="shepherd" className="gap-0">
              <div className="overflow-x-auto border-b border-border [scrollbar-width:thin]">
                <TabsList>
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <TabsTrigger key={category.id} value={category.id}>
                        <Icon className="h-4 w-4" />
                        {category.label}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-foreground">
                          {category.rows.length}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {categories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <CategoryPanel category={category} />
                </TabsContent>
              ))}
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
