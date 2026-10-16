"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronRight, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { MobileShell } from "../_components/mobile-shell";
import { MobileActionBar } from "../_components/mobile-action-bar";
import { MobilePersonList } from "../_components/mobile-person-list";
import { submitLifeGroupAttendance } from "../_lib/submit-attendance";

export function MobileLifeGroupAttendance() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated } = usePeople();
  const {
    lifeGroups,
    lifeGroupMembers,
    hydrated,
    isSaving,
    recordLifeGroupAttendance,
  } = useGroupsMinistry();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const submitInFlight = useRef(false);

  const loading = !hydrated || !peopleHydrated;

  const peopleById = useMemo(
    () => new Map(people.map(person => [person.id, person])),
    [people],
  );

  const selectedGroup = useMemo(
    () => lifeGroups.find(group => group.id === selectedGroupId) ?? null,
    [lifeGroups, selectedGroupId],
  );

  const memberCountByGroup = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of lifeGroupMembers) {
      counts.set(member.lifeGroupId, (counts.get(member.lifeGroupId) ?? 0) + 1);
    }
    return counts;
  }, [lifeGroupMembers]);

  const members = useMemo(() => {
    if (!selectedGroupId) return [];
    return lifeGroupMembers
      .filter(member => member.lifeGroupId === selectedGroupId)
      .map(member => peopleById.get(member.personId))
      .filter((person): person is NonNullable<typeof person> => Boolean(person))
      .map(person => ({
        id: person.id,
        name: person.name,
        householdName: person.householdName,
      }));
  }, [lifeGroupMembers, selectedGroupId, peopleById]);

  const openGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedIds([]);
  };

  const closeGroup = () => {
    setSelectedGroupId(null);
    setSelectedIds([]);
  };

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedGroupId ||
      selectedIds.length === 0 ||
      submitInFlight.current
    ) {
      return;
    }

    submitInFlight.current = true;
    try {
      const ok = await submitLifeGroupAttendance({
        lifeGroupId: selectedGroupId,
        date,
        personIds: selectedIds,
        recordLifeGroupAttendance,
      });

      if (!ok) {
        toast.error("Could not save attendance", {
          description: "Please try again.",
        });
        return;
      }

      toast.success("Attendance recorded", {
        description: `${selectedIds.length} at ${selectedGroup?.name ?? "life group"}`,
      });
      router.push("/mobile");
    } finally {
      submitInFlight.current = false;
    }
  };

  if (loading) {
    return (
      <MobileShell title="Life Group" backHref="/mobile">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </MobileShell>
    );
  }

  if (!selectedGroup) {
    return (
      <MobileShell
        title="Life Group"
        subtitle="Pick a group"
        backHref="/mobile"
      >
        {lifeGroups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-card py-14 text-center text-[15px] text-muted-foreground">
            <UsersRound className="size-6" strokeWidth={1.8} />
            No life groups yet
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[20px] bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
            {lifeGroups.map(group => (
              <li key={group.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => openGroup(group.id)}
                  className="flex min-h-[72px] w-full items-center gap-3.5 px-4 text-left transition-colors duration-200 hover:bg-muted/50 active:bg-muted motion-reduce:transition-none"
                >
                  <span className="flex w-7 shrink-0 items-center justify-center text-foreground">
                    <UsersRound className="size-6" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium">
                      {group.name}
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                      {memberCountByGroup.get(group.id) ?? 0} members
                      {group.schedule ? ` · ${group.schedule}` : ""}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground/70"
                    strokeWidth={1.8}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={selectedGroup.name}
      subtitle="Life group attendance"
      // Back returns to the group picker rather than leaving the flow.
      onBack={closeGroup}
      withActionBarSpacing
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 rounded-xl px-3 text-[13px]"
          onClick={closeGroup}
        >
          Change
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={event => setDate(event.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>Members</Label>
          <MobilePersonList
            people={members}
            selectedIds={selectedIds}
            onToggle={toggle}
            onSelectAll={ids => setSelectedIds(ids)}
            onClear={() => setSelectedIds([])}
            emptyLabel="No members in this group"
          />
        </div>
      </div>

      <MobileActionBar hint={`${selectedIds.length} selected`}>
        <Button
          type="button"
          className="h-12 w-full gap-1.5"
          disabled={selectedIds.length === 0 || isSaving}
          onClick={() => void handleSubmit()}
        >
          {isSaving ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save attendance
            </>
          )}
        </Button>
      </MobileActionBar>
    </MobileShell>
  );
}
