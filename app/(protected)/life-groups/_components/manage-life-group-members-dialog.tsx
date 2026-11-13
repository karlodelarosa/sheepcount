"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/person-select";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { X, UserPlus } from "lucide-react";

export function ManageLifeGroupMembersDialog({
  open,
  onOpenChange,
  groupId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
}) {
  const { people } = usePeople();
  const {
    lifeGroups,
    lifeGroupMembers,
    assignLifeGroupMember,
    removeLifeGroupMemberById,
    isSaving,
  } = useGroupsMinistry();
  const [returnFocus] = useState(() =>
    typeof document !== "undefined"
      ? (document.activeElement as HTMLElement | null)
      : null,
  );
  const [search, setSearch] = useState("");
  const [personId, setPersonId] = useState("");
  const group = lifeGroups.find(g => g.id === groupId);
  const memberships = lifeGroupMembers.filter(m => m.lifeGroupId === groupId);
  const available = people.filter(
    p => !memberships.some(m => m.personId === p.id),
  );
  const members = memberships.map(m => ({
    ...m,
    person: people.find(p => p.id === m.personId),
  }));
  async function addMember() {
    if (!groupId || !personId || isSaving) return;
    if (await assignLifeGroupMember(groupId, personId)) setPersonId("");
  }
  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!isSaving) onOpenChange(value);
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onCloseAutoFocus={() => returnFocus?.focus()}
      >
        <DialogHeader>
          <DialogTitle>Manage Life Group Members</DialogTitle>
          <DialogDescription>{group?.name}</DialogDescription>
        </DialogHeader>
        <fieldset disabled={isSaving} className="space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="life-group-person">Add a person</Label>
            <PersonSelect
              id="life-group-person"
              disabled={isSaving}
              people={available}
              value={personId}
              onValueChange={setPersonId}
              placeholder="Choose a person"
            />
          </div>
          <Button
            onClick={() => void addMember()}
            disabled={!personId || isSaving}
            className="gap-2 bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
          >
            <UserPlus className="size-4" />
            Add to Group
          </Button>
          <Input
            aria-label="Search group members"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <p className="text-sm font-medium">
            Current Members ({members.length})
          </p>
          <div className="max-h-72 overflow-y-auto divide-y rounded-xl border">
            {members
              .filter(m =>
                (m.person?.name ?? "Unknown person")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <span className="min-w-0 break-words">
                    {m.person?.name ?? "Unknown person"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isSaving}
                    aria-label={`Remove ${m.person?.name ?? "person"} from group`}
                    onClick={() => {
                      if (!isSaving) void removeLifeGroupMemberById(m.id);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            {!members.some(m =>
              (m.person?.name ?? "Unknown person")
                .toLowerCase()
                .includes(search.toLowerCase()),
            ) && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {search ? "No members found" : "No members yet"}
              </p>
            )}
          </div>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
