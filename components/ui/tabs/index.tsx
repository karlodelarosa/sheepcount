"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const TabsState = React.createContext({ active: "", content: "" });

function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const [active, setActive] = React.useOptimistic(value ?? uncontrolled);
  const content = React.useDeferredValue(active);
  return (
    <TabsState.Provider value={{ active, content }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={active}
        onValueChange={next => {
          React.startTransition(() => {
            setActive(next);
            if (value === undefined) setUncontrolled(next);
            onValueChange?.(next);
          });
        }}
        className={cn("flex min-w-0 flex-col gap-2", className)}
        {...props}
      />
    </TabsState.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        className,
        "flex h-auto min-h-12 w-full max-w-none min-w-0 flex-row justify-start gap-4 overflow-x-auto rounded-none border-x-0 border-t-0 border-b border-border bg-transparent p-0 dark:bg-transparent sm:gap-8",
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        className,
        "relative inline-flex h-auto min-h-12 shrink-0 flex-none items-center justify-center gap-1.5 rounded-none border-0 bg-transparent px-1 py-3 text-sm font-medium text-muted-foreground shadow-none whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[var(--accent-color-strong)] data-[state=active]:after:bg-[var(--accent-color)] dark:bg-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-[var(--accent-color)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      )}
      {...props}
    />
  );
}

function TabSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading tab content"
      className="space-y-4 py-4"
    >
      <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded bg-muted" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function TabsContent({
  className,
  children,
  value,
  forceMount,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const { active, content } = React.useContext(TabsState);
  const ready = content === value;
  const [visited, setVisited] = React.useState(ready);
  React.useEffect(() => {
    if (ready) setVisited(true);
  }, [ready]);
  const selected = active === value;
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      forceMount
      hidden={!selected}
      className={cn(
        "motion-panel min-w-0 flex-1 outline-none data-[state=inactive]:hidden",
        className,
      )}
      {...props}
    >
      {selected && !ready && !visited && <TabSkeleton />}
      {(visited || ready || forceMount) && (
        <React.Suspense fallback={<TabSkeleton />}>{children}</React.Suspense>
      )}
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
