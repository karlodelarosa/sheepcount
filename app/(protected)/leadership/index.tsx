"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Network, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import { AdminPositionsTab } from "./_components/admin-positions-tab";
import { OrgChartTab } from "./_components/org-chart-tab";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { CollectionLoading } from "@/components/ui/directory-page-header/collection-toolbar";

type LeadershipTab = "positions" | "org-chart";

function parseTab(value: string | null): LeadershipTab {
  return value === "org-chart" ? "org-chart" : "positions";
}

export function LeadershipView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { entitlements, isLoading } = useEntitlements();
  const activeTab = parseTab(searchParams.get("tab"));
  const leadershipEnabled = isItemEnabled(entitlements.modules, "leadership");

  const setActiveTab = (tab: string) => {
    router.replace(`/leadership?tab=${tab}`, { scroll: false });
  };

  if (isLoading) {
    return <CollectionLoading />;
  }

  if (!leadershipEnabled) {
    return (
      <div className="space-y-6">
        <DirectoryTitleCard
          title="Leadership"
          description="Administrative roles and ministry organization structure"
          icon={Network}
        />

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Leadership is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              This module is managed by your platform administrator. Contact
              support if you need leadership tools for your church.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Leadership"
        description="Administrative roles and ministry organization structure"
        icon={Network}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="positions">
            <Shield className="w-4 h-4" />
            Admin Positions
          </TabsTrigger>
          <TabsTrigger value="org-chart">
            <Network className="w-4 h-4" />
            Organization Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <AdminPositionsTab />
        </TabsContent>

        <TabsContent value="org-chart" className="mt-4">
          <OrgChartTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
