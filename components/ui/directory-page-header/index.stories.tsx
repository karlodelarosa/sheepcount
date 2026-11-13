import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { GraduationCap, Plus, Users, ListChecks } from "lucide-react";
import { DirectoryTitleCard } from ".";
import { CollectionToolbar } from "./collection-toolbar";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const meta: Meta<typeof DirectoryTitleCard> = {
  title: "Layout/Workspace Density",
  component: DirectoryTitleCard,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof meta>;

function WorkspacePreview() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  return (
    <main
      data-app-density="compact"
      className="min-h-screen space-y-4 bg-background p-4 lg:p-5"
    >
      <DirectoryTitleCard
        title="Training Academy"
        description="Competency-based courses with sequential modules"
        icon={GraduationCap}
        action={{ label: "Add Course", icon: Plus, onClick: () => {} }}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard label="Courses" value={3} icon={GraduationCap} />
        <DashboardMetricCard label="Modules" value={10} icon={ListChecks} />
        <DashboardMetricCard label="Enrollments" value={2} icon={Users} />
      </div>
      <CollectionToolbar
        label="training courses"
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        options={[{ value: "all", label: "All categories" }]}
        count={3}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          "Cell Leadership 101",
          "Worship Leading Basics",
          "Ministry Foundations",
        ].map(name => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                Practical training for your ministry team.
              </CardDescription>
            </CardHeader>
            <CardContent>4 modules · 2 enrolled</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

export const ResponsiveWorkspace: Story = {
  render: () => <WorkspacePreview />,
};
