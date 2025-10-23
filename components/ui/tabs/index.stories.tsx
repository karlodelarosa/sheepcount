// Tabs.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./index";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Mock tabs data
const tabData = [
  { value: "tab1", label: "Tab 1", content: "This is content for Tab 1." },
  { value: "tab2", label: "Tab 2", content: "Content for Tab 2 goes here." },
  { value: "tab3", label: "Tab 3", content: "Here is what Tab 3 shows." },
];

export const Default: Story = {
  render: () => (
    <Tabs defaultValue={tabData[0].value} className="w-[400px]">
      <TabsList>
        {tabData.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabData.map(tab => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="p-4 border rounded-md"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  ),
};
