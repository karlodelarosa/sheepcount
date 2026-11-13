import { expect, userEvent, within } from "storybook/test";
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

export const PreservesVisitedContent: Story = {
  render: () => (
    <Tabs defaultValue="first">
      <TabsList>
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
      </TabsList>
      <TabsContent value="first">
        <input aria-label="Draft" />
      </TabsContent>
      <TabsContent value="second">Second content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), "Keep this draft");
    await userEvent.click(canvas.getByRole("tab", { name: "Second" }));
    await expect(canvas.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByText("Second content")).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "First" }));
    await expect(canvas.getByRole("textbox")).toHaveValue("Keep this draft");
  },
};

function PendingTabsExample() {
  const [resource] = React.useState(() => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>(done => {
      resolve = done;
    });
    return { promise, resolve };
  });
  function PendingContent() {
    return <div>{React.use(resource.promise)}</div>;
  }
  return (
    <>
      <button onClick={() => resource.resolve("Loaded content")}>
        Finish loading
      </button>
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First content</TabsContent>
        <TabsContent value="pending">
          <PendingContent />
        </TabsContent>
      </Tabs>
    </>
  );
}

export const SwitchesWhileLoading: Story = {
  render: () => <PendingTabsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Pending" }));
    await expect(canvas.getByRole("tab", { name: "Pending" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("status")).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "First" }));
    await expect(canvas.getByText("First content")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Finish loading" }),
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Pending" }));
    await expect(canvas.getByText("Loaded content")).toBeVisible();
  },
};

export const ControlledSelectionStaysAuthoritative: Story = {
  render: () => (
    <Tabs value="first" onValueChange={() => {}}>
      <TabsList>
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
      </TabsList>
      <TabsContent value="first">First content</TabsContent>
      <TabsContent value="second">Second content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Second" }));
    await expect(canvas.getByRole("tab", { name: "First" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByText("First content")).toBeVisible();
  },
};
