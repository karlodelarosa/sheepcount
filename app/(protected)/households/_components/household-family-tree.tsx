"use client";

import { Fragment, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { HouseholdOtherResident, Person } from "@/lib/people";
import { buildFamilyTreeLayout, type TreeNode } from "../_lib/family-tree";
import { cn } from "@/lib/utils";

type HouseholdFamilyTreeProps = {
  members: Person[];
  residents: HouseholdOtherResident[];
};

const lineClass = "bg-slate-300 dark:bg-zinc-600";

function roleBadgeClass(role: string, kind: TreeNode["kind"]) {
  if (kind === "resident") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
  }
  if (role === "Head") {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200";
  }
  if (role === "Spouse") {
    return "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200";
  }
  if (role === "Child") {
    return "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200";
  }
  return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200";
}

function avatarClass(role: string, kind: TreeNode["kind"]) {
  if (kind === "resident") {
    return "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700";
  }
  if (role === "Head") {
    return "from-indigo-500 to-indigo-700 dark:from-purple-600 dark:to-purple-800";
  }
  if (role === "Spouse") {
    return "from-violet-500 to-violet-700 dark:from-violet-600 dark:to-violet-800";
  }
  if (role === "Child") {
    return "from-sky-500 to-sky-700 dark:from-sky-600 dark:to-sky-800";
  }
  return "from-slate-600 to-slate-800 dark:from-zinc-600 dark:to-zinc-800";
}

function PersonCard({
  node,
  onNavigate,
  dashed = false,
}: {
  node: TreeNode;
  onNavigate: (personId: string) => void;
  dashed?: boolean;
}) {
  const isClickable = node.kind === "member" && node.personId;

  const card = (
    <div
      className={cn(
        "flex w-[9.5rem] flex-col items-center rounded-xl border p-3 text-center shadow-sm",
        dashed
          ? "border-dashed border-amber-300/80 bg-amber-50/50 dark:border-amber-700/60 dark:bg-amber-900/20"
          : "border-slate-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-900/80",
        isClickable &&
          "transition hover:border-indigo-300 hover:shadow-md dark:hover:border-purple-500/60",
      )}
    >
      <div
        className={cn(
          "mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow",
          avatarClass(node.role, node.kind),
        )}
      >
        {node.name.charAt(0).toUpperCase()}
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-tight text-slate-900 dark:text-white">
        {node.name}
      </p>
      <Badge
        className={cn(
          "mt-2 rounded-md border-0 text-[10px] font-medium",
          roleBadgeClass(node.role, node.kind),
        )}
      >
        {node.role}
      </Badge>
      {node.age != null && (
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Age {node.age}
        </p>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <button type="button" onClick={() => onNavigate(node.personId!)}>
        {card}
      </button>
    );
  }

  return card;
}

function TierLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
      {children}
    </p>
  );
}

function ParentsTier({
  nodes,
  onNavigate,
}: {
  nodes: TreeNode[];
  onNavigate: (personId: string) => void;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <TierLabel>Parents</TierLabel>
      <div className="flex items-center justify-center">
        {nodes.map((node, index) => (
          <Fragment key={node.id}>
            {index > 0 && (
              <div
                className={cn("mx-2 h-px w-10 sm:w-14", lineClass)}
                aria-hidden
              />
            )}
            <PersonCard node={node} onNavigate={onNavigate} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ChildrenTier({
  nodes,
  onNavigate,
  showStemAbove,
}: {
  nodes: TreeNode[];
  onNavigate: (personId: string) => void;
  showStemAbove: boolean;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center">
      <TierLabel>Children</TierLabel>
      {showStemAbove && (
        <div className={cn("h-8 w-px", lineClass)} aria-hidden />
      )}
      <div className="relative flex w-full max-w-5xl flex-wrap justify-center gap-x-8 gap-y-2 px-4">
        {nodes.length > 1 && (
          <div
            className={cn("absolute top-0 h-px", lineClass)}
            style={{ left: "8%", right: "8%" }}
            aria-hidden
          />
        )}
        {nodes.map(node => (
          <div
            key={node.id}
            className="relative flex flex-col items-center pt-8"
          >
            <div
              className={cn(
                "absolute top-0 left-1/2 h-8 w-px -translate-x-1/2",
                lineClass,
              )}
              aria-hidden
            />
            <PersonCard node={node} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersRow({
  label,
  nodes,
  onNavigate,
  dashed = false,
}: {
  label: string;
  nodes: TreeNode[];
  onNavigate: (personId: string) => void;
  dashed?: boolean;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center border-t border-slate-200/60 pt-8 dark:border-zinc-700/60">
      <TierLabel>{label}</TierLabel>
      <div className="flex flex-wrap justify-center gap-4">
        {nodes.map(node => (
          <PersonCard
            key={node.id}
            node={node}
            onNavigate={onNavigate}
            dashed={dashed}
          />
        ))}
      </div>
    </div>
  );
}

export function HouseholdFamilyTree({
  members,
  residents,
}: HouseholdFamilyTreeProps) {
  const router = useRouter();
  const layout = useMemo(
    () => buildFamilyTreeLayout(members, residents),
    [members, residents],
  );

  const handleNavigate = (personId: string) => {
    router.push(`/people/${personId}`);
  };

  if (layout.isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-zinc-600 dark:text-zinc-500">
        Add members to see the family tree.
      </div>
    );
  }

  const hasParents = layout.parents.length > 0;
  const hasChildren = layout.children.length > 0;
  const showParentChildLink = hasParents && hasChildren;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-zinc-400">
        Layout is based on household roles. Click a church member to open their
        profile.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-white p-6 dark:border-zinc-700/60 dark:from-zinc-900/40 dark:to-zinc-900/20">
        <div className="mx-auto flex min-w-[18rem] max-w-5xl flex-col items-center gap-2">
          <ParentsTier nodes={layout.parents} onNavigate={handleNavigate} />

          {showParentChildLink && (
            <div className="flex flex-col items-center" aria-hidden>
              <div className={cn("h-8 w-px", lineClass)} />
              {layout.parents.length > 1 && (
                <div className={cn("h-px w-24 sm:w-32", lineClass)} />
              )}
              <div className={cn("h-8 w-px", lineClass)} />
            </div>
          )}

          <ChildrenTier
            nodes={layout.children}
            onNavigate={handleNavigate}
            showStemAbove={!showParentChildLink && hasChildren}
          />

          {!hasParents && !hasChildren && (
            <MembersRow
              label="Household"
              nodes={[...layout.others, ...layout.residents]}
              onNavigate={handleNavigate}
              dashed
            />
          )}

          {(hasParents || hasChildren) && (
            <>
              <MembersRow
                label="Other Members"
                nodes={layout.others}
                onNavigate={handleNavigate}
              />
              <MembersRow
                label="Other Residents"
                nodes={layout.residents}
                onNavigate={handleNavigate}
                dashed
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
