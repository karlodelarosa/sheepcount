"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Network } from "lucide-react";
import { AdminPositionsTab } from "./_components/admin-positions-tab";
import { OrgChartTab } from "./_components/org-chart-tab";

type LeadershipTab = "positions" | "org-chart";

function parseTab(value: string | null): LeadershipTab {
  return value === "org-chart" ? "org-chart" : "positions";
}

export function LeadershipView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = parseTab(searchParams.get("tab"));

  const setActiveTab = (tab: string) => {
    router.replace(`/leadership?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Leadership
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">
          Administrative roles and ministry organization structure
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="positions" className="gap-1.5">
            <Shield className="w-4 h-4" />
            Admin Positions
          </TabsTrigger>
          <TabsTrigger value="org-chart" className="gap-1.5">
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
