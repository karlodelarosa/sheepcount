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
import { MobilePageHeader } from "../_components/mobile-page-header";

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

      <MobilePageHeader
        title="Shepherding"
        subtitle={
          loading
            ? "Loading who needs attention…"
            : visibleItems.length === 0
              ? "Everyone’s accounted for"
              : `${visibleItems.length} ${
                  visibleItems.length === 1 ? "person needs" : "people need"
                } attention`
        }
      />

      <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto bg-background/88 px-4 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
        {groupFilters.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setGroupId(option.value)}
            className={cn(
              "min-h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 motion-reduce:transition-none",
              groupId === option.value
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-6 px-4 pb-28 pt-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-[20px]" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-16 text-center ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            <HeartHandshake
              className="size-7 text-foreground"
              strokeWidth={1.8}
            />
            <div>
              <p className="text-[16px] font-medium">All caught up</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                No one needs attention right now.
              </p>
            </div>
          </div>
        ) : (
          groups.map(group => {
            const styles = PASTORAL_LEVEL_STYLES[group.level];
            return (
              <section key={group.level} className="space-y-3">
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

                <ul className="space-y-3">
                  {group.items.map(item => {
                    const action = LEVEL_ACTION[item.status.level];
                    const phone = item.person.phone?.trim();
                    const isPending = pendingId === item.person.id;
                    return (
                      <li
                        key={item.person.id}
                        className={cn(
                          "rounded-[20px] bg-card p-4 ring-1 ring-black/[0.04] dark:ring-white/[0.08]",
                          styles.banner,
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold">
                            {item.person.name}
                          </p>
                          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                            {item.person.householdName || "—"}
                          </p>
                          <p className="mt-2 text-[13px] leading-[18px] text-muted-foreground">
                            {item.status.description}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {phone ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-11 flex-1 gap-1.5 rounded-xl"
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
                            className="h-11 flex-1 gap-1.5 rounded-xl"
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
