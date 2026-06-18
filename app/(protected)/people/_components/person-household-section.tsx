"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Crown,
  Home,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import type { Household, Person } from "@/lib/people";
import {
  EmptyState,
  panelCard,
  PersonAvatar,
  SectionHeader,
} from "./person-detail-ui";
import { cn } from "@/lib/utils";

interface PersonHouseholdSectionProps {
  person: Person;
  household?: Household;
  householdMembers: Person[];
  hasHousehold: boolean;
  inFamilyHousehold: boolean;
  onAssignClick: () => void;
}

export function PersonHouseholdSection({
  person,
  household,
  householdMembers,
  hasHousehold,
  inFamilyHousehold,
  onAssignClick,
}: PersonHouseholdSectionProps) {
  const router = useRouter();

  return (
    <div className={cn(panelCard, "p-5 space-y-4")}>
      <SectionHeader
        icon={Home}
        title="Household"
        description={
          hasHousehold
            ? inFamilyHousehold
              ? `${householdMembers.length + 1} people in this family`
              : "Individual household"
            : "Link to a family unit"
        }
        action={
          hasHousehold ? (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-slate-600 dark:text-zinc-400 shrink-0"
              onClick={() => router.push(`/households/${person.householdId}`)}
            >
              View
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          ) : undefined
        }
      />

      {!hasHousehold ? (
        <EmptyState
          icon={UserPlus}
          title="No household on file"
          description="Assign this person to a family household to track members together."
          action={
            <Button
              variant="outline"
              onClick={onAssignClick}
              className="rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              Assign to Household
            </Button>
          }
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => router.push(`/households/${person.householdId}`)}
            className="w-full text-left rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 hover:shadow-md hover:border-slate-300/80 transition-all dark:from-zinc-800/80 dark:to-zinc-900/80 dark:border-zinc-700/80 dark:hover:border-zinc-600/80 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800 dark:bg-purple-700 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:underline truncate">
                    {person.householdName || household?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="rounded-md text-xs font-normal"
                    >
                      {person.role}
                    </Badge>
                    {!inFamilyHousehold && (
                      <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                        Solo household
                      </span>
                    )}
                    {inFamilyHousehold && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                        Family
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300 shrink-0 mt-1 transition-colors" />
            </div>
            {household?.address && (
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-3 flex items-start gap-2 pl-14">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{household.address}</span>
              </p>
            )}
          </button>

          {householdMembers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                  Family members
                </p>
              </div>
              <div className="space-y-1.5">
                {householdMembers.map(member => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => router.push(`/people/${member.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 dark:bg-zinc-800/50 dark:border-zinc-700/60 dark:hover:bg-zinc-800 transition-colors text-left group"
                  >
                    <PersonAvatar name={member.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:underline">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        {member.role}
                        {member.role === "Head" && (
                          <Crown className="w-3 h-3 inline ml-1 text-amber-500" />
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 dark:text-zinc-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onAssignClick}
            className="w-full rounded-xl border-slate-200 dark:border-zinc-700"
          >
            {inFamilyHousehold ? "Change Household" : "Join Family Household"}
          </Button>
        </>
      )}
    </div>
  );
}
