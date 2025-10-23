import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./index";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Collapsible> = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <div className="max-w-sm w-full">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            Click to toggle content
            <span className="ml-2">▼</span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 rounded-md border p-4 bg-muted">
          <p>
            This is the collapsible content area. You can put text, components,
            or even a form here. Try clicking the button again to hide it.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
