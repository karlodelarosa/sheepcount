// Tooltip.stories.tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./index";
import { Button } from "@/components/ui/button/index";

const meta: Meta<typeof Tooltip> = {
  title: "ui/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip content</TooltipContent>
    </Tooltip>
  ),
};

export const WithSideOffset: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={10}>Offset tooltip content</TooltipContent>
    </Tooltip>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        This is a longer tooltip text to demonstrate wrapping behavior.
      </TooltipContent>
    </Tooltip>
  ),
};
