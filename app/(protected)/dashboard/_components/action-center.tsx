import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cake,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/people";
import type { ShepherdItem } from "@/lib/shepherding";
import type { UpcomingBirthday } from "../_lib/dashboard-actions";

interface ActionRow {
  key: string;
  name: string;
  context: string;
  href: string;
  /** Optional label for a small pill on the right (e.g. "Today"). */
  tag?: string;
}

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
  };
}

function ActionSection({
  title,
  icon: Icon,
  accent,
  rows,
  viewAllHref,
  emptyLabel,
  extra,
}: {
  title: string;
  icon: typeof HeartHandshake;
  accent: string;
  rows: ActionRow[];
  viewAllHref: string;
  emptyLabel: string;
  /** Optional non-person row rendered above the list (e.g. a data-gap prompt). */
  extra?: React.ReactNode;
}) {
  const total = rows.length;
  const visible = rows.slice(0, MAX_ROWS);
  const remaining = total - visible.length;
  const isEmpty = total === 0 && !extra;

  return (
    <Card className="border-border/70">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md",
                accent,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {title}
          </span>
          {total > 0 ? (
            <Badge variant="secondary" className="h-5 text-xs">
              {total}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-3 pb-3">
        {extra}

        {isEmpty ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {emptyLabel}
          </div>
        ) : (
          visible.map(row => (
            <Link
              key={row.key}
              href={row.href}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{row.name}</span>
                <span className="block truncate text-muted-foreground">
                  {row.context}
                </span>
              </span>
              {row.tag ? (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {row.tag}
                </span>
              ) : null}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Link>
          ))
        )}

        {remaining > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 w-full justify-between text-xs"
            asChild
          >
            <Link href={viewAllHref}>
              +{remaining} more
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
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
  const shepherdRows = shepherd.map(toShepherdRow);

  const assimilateRows: ActionRow[] = [
    ...assimilateContacts.map(item => ({
      key: item.person.id,
      name: item.person.name,
      context: "First-time — needs contact",
      href: `/people/${item.person.id}`,
      tag: "New",
    })),
    ...unassignedNewMembers.map(person => ({
      key: person.id,
      name: person.name,
      context: "New member — no life group",
      href: `/people/${person.id}`,
    })),
  ];

  const followUpRows = followUps.map(toShepherdRow);

  const birthdayRows: ActionRow[] = upcomingBirthdays.map(entry => ({
    key: entry.person.id,
    name: entry.person.name,
    context: entry.person.householdName || "—",
    href: `/people/${entry.person.id}`,
    tag:
      entry.inDays === 0
        ? "Today"
        : entry.inDays === 1
          ? "Tomorrow"
          : `${entry.inDays}d`,
  }));

  const totalActions =
    shepherdRows.length +
    assimilateRows.length +
    followUpRows.length +
    birthdayRows.length +
    (unrecordedSundayLabel ? 1 : 0);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Needs Attention</h2>
        <span className="text-xs text-muted-foreground">
          {totalActions === 0
            ? "Nothing outstanding"
            : `${totalActions} action${totalActions === 1 ? "" : "s"} across the church`}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ActionSection
          title="To shepherd"
          icon={HeartHandshake}
          accent="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          rows={shepherdRows}
          viewAllHref="/people"
          emptyLabel="No one is slipping in attendance."
        />

        <ActionSection
          title="To assimilate"
          icon={UserPlus}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
          rows={assimilateRows}
          viewAllHref="/growth-track"
          emptyLabel="Everyone new is connected."
        />

        <ActionSection
          title="Follow-ups"
          icon={ClipboardList}
          accent="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          rows={followUpRows}
          viewAllHref="/growth-track"
          emptyLabel="No follow-ups pending."
        />

        <ActionSection
          title="Reminders"
          icon={Cake}
          accent="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
          rows={birthdayRows}
          viewAllHref="/service-attendance"
          emptyLabel="No reminders this week."
          extra={
            unrecordedSundayLabel ? (
              <Link
                href="/service-attendance"
                className="mb-1 flex items-center gap-2.5 rounded-lg border border-violet-200/70 bg-violet-50/70 px-2 py-1.5 text-xs transition-colors hover:bg-violet-100/70 dark:border-violet-900/50 dark:bg-violet-950/30"
              >
                <ClipboardList className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    Record {unrecordedSundayLabel} attendance
                  </span>
                  <span className="block text-muted-foreground">
                    No session logged yet
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </Link>
            ) : null
          }
        />
      </div>
    </section>
  );
}
