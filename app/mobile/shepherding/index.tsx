"use client";

import { useMemo, useState } from "react";
import { Check, HeartHandshake, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useGrowthTrack } from "@/lib/growth-track";
import {
  PASTORAL_LEVEL_STYLES,
  type PastoralCareLevel,
} from "@/app/(protected)/people/_lib/person-pastoral-status";
import {
  buildShepherdWorklist,
  groupByLevel,
  LEVEL_ACTION,
  type ShepherdItem,
} from "@/lib/shepherding";
import { MobileTabBar } from "../_components/mobile-tab-bar";
import { MobileTopBar } from "../_components/mobile-top-bar";

const LEVEL_HEADERS: Partial<Record<PastoralCareLevel, string>> = {
  needs_visit: "Needs visiting",
  needs_contact: "Needs first contact",
  needs_follow_up: "Needs follow-up",
  check_in: "Due for check-in",
};

export function MobileShepherding() {
  const { people, hydrated: peopleHydrated } = usePeople();
  const { attendanceRows, hydrated: attendanceHydrated } =
    useServiceAttendance();
  const {
    lifeGroups,
    lifeGroupMembers,
    hydrated: groupsHydrated,
  } = useGroupsMinistry();
  const {
    growthPeople,
    activities,
    hydrated: growthHydrated,
    isSaving,
    logOutreach,
  } = useGrowthTrack();

  const [groupId, setGroupId] = useState<string | "all">("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loading =
    !peopleHydrated ||
    !attendanceHydrated ||
    !groupsHydrated ||
    !growthHydrated;

  const worklist = useMemo(
    () =>
      buildShepherdWorklist({
        people,
        attendanceRows,
        growthPeople,
        activities,
      }),
    [people, attendanceRows, growthPeople, activities],
  );

  const memberIdsByGroup = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const member of lifeGroupMembers) {
      let set = map.get(member.lifeGroupId);
      if (!set) {
        set = new Set();
        map.set(member.lifeGroupId, set);
      }
      set.add(member.personId);
    }
    return map;
  }, [lifeGroupMembers]);

  const visibleItems = useMemo(() => {
    if (groupId === "all") return worklist;
    const memberIds = memberIdsByGroup.get(groupId);
    if (!memberIds) return [];
    return worklist.filter(item => memberIds.has(item.person.id));
  }, [worklist, groupId, memberIdsByGroup]);

  const groups = useMemo(() => groupByLevel(visibleItems), [visibleItems]);

  const handleLog = async (item: ShepherdItem) => {
    const action = LEVEL_ACTION[item.status.level];
    if (!action || pendingId) return;
    setPendingId(item.person.id);
    try {
      await logOutreach(item.person.id, action.type);
    } finally {
      setPendingId(null);
    }
  };

  const groupFilters: { value: string; label: string }[] = [
    { value: "all", label: "All groups" },
    ...lifeGroups.map(group => ({ value: group.id, label: group.name })),
  ];

  return (
    <>
      <MobileTopBar />

      <header className="border-b px-5 py-5">
        <h1 className="text-xl font-semibold">Shepherding</h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading who needs attention…"
            : visibleItems.length === 0
              ? "Everyone's accounted for"
              : `${visibleItems.length} ${
                  visibleItems.length === 1 ? "person needs" : "people need"
                } attention`}
        </p>
      </header>

      <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b bg-background/95 px-4 py-3 backdrop-blur">
        {groupFilters.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setGroupId(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              groupId === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-5 px-4 py-4 pb-24">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium">All caught up</p>
              <p className="text-xs text-muted-foreground">
                No one needs attention right now.
              </p>
            </div>
          </div>
        ) : (
          groups.map(group => {
            const styles = PASTORAL_LEVEL_STYLES[group.level];
            return (
              <section key={group.level} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      styles.badge,
                    )}
                  >
                    {LEVEL_HEADERS[group.level] ?? group.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>

                <ul className="space-y-2">
                  {group.items.map(item => {
                    const action = LEVEL_ACTION[item.status.level];
                    const phone = item.person.phone?.trim();
                    const isPending = pendingId === item.person.id;
                    return (
                      <li
                        key={item.person.id}
                        className={cn(
                          "rounded-xl border bg-card p-3",
                          styles.banner,
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.person.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.person.householdName || "—"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.status.description}
                          </p>
                        </div>

                        <div className="mt-3 flex gap-2">
                          {phone ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-9 flex-1 gap-1.5"
                            >
                              <a href={`tel:${phone}`}>
                                <Phone className="h-4 w-4" />
                                Call
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 flex-1 gap-1.5"
                            disabled={isSaving}
                            onClick={() => void handleLog(item)}
                          >
                            {isPending ? (
                              "Saving…"
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                {action?.label ?? "Log"}
                              </>
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </main>

      <MobileTabBar />
    </>
  );
}
