import Link from "next/link";
import {
  ChevronRight,
  Home,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import type { HouseholdDirectoryEntry } from "../_lib/directory";
import { getMemberInitials } from "../_lib/directory";

type HouseholdDirectoryCardProps = {
  entry: HouseholdDirectoryEntry;
};

export function HouseholdDirectoryCard({ entry }: HouseholdDirectoryCardProps) {
  const { household, members, head } = entry;
  const { initials, overflow } = getMemberInitials(members);
  const memberLabel = `${members.length} ${
    members.length === 1 ? "member" : "members"
  }`;

  return (
    <Link
      href={`/households/${household.id}`}
      aria-label={`Open ${household.name}`}
      className="group flex min-h-72 flex-col rounded-xl border border-border/70 bg-card p-5 text-left shadow-sm outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[var(--accent-color-border)] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
          <Home className="size-6" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight text-foreground">
            {household.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <UsersRound className="size-4" aria-hidden="true" />
            {memberLabel}
          </p>
        </div>

        <ChevronRight
          className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 space-y-3 border-y border-border/70 py-4 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <UserRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {head ? (
            <p className="min-w-0 truncate text-foreground">
              <span className="text-muted-foreground">Head:</span>{" "}
              <span className="font-medium">{head.name}</span>
            </p>
          ) : (
            <p className="italic text-muted-foreground">No head of household</p>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <MapPin
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {household.address ? (
            <p className="truncate text-foreground">{household.address}</p>
          ) : (
            <p className="font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              Address not set
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex min-h-11 items-end pt-4">
        {members.length > 0 ? (
          <div
            className="flex items-center -space-x-1.5"
            aria-label={memberLabel}
          >
            {initials.map((initial, index) => (
              <span
                key={`${members[index].id}-${initial}`}
                className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-[var(--accent-color-soft)] text-xs font-bold text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                title={members[index].name}
              >
                {initial}
              </span>
            ))}
            {overflow > 0 ? (
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-bold text-muted-foreground">
                +{overflow}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm italic text-muted-foreground">
            <UsersRound className="size-4" aria-hidden="true" />
            No members assigned
          </p>
        )}
      </div>
    </Link>
  );
}
