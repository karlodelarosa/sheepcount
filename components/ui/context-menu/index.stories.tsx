import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./index";

const meta: Meta<typeof ContextMenu> = {
  title: "ui/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
          Right click me
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuLabel inset>Options</ContextMenuLabel>
        <ContextMenuItem onSelect={() => alert("Edit clicked")}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => alert("Duplicate clicked")}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Always show</ContextMenuCheckboxItem>
        <ContextMenuSeparator />

        <ContextMenuRadioGroup value="medium">
          <ContextMenuLabel inset>Size</ContextMenuLabel>
          <ContextMenuRadioItem value="small">Small</ContextMenuRadioItem>
          <ContextMenuRadioItem value="medium">Medium</ContextMenuRadioItem>
          <ContextMenuRadioItem value="large">Large</ContextMenuRadioItem>
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Export</ContextMenuItem>
            <ContextMenuItem>Share</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
