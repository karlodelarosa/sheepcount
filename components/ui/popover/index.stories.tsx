"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./index";

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium leading-none">Popover Title</h4>
          <p className="text-sm text-muted-foreground">
            This is a popover component. You can place any content here — text, forms, or actions.
          </p>
          <Button size="sm">Confirm</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const CustomAlign: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Align: Start</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="text-sm text-muted-foreground">
          Popover aligned to <b>start</b>.
        </div>
      </PopoverContent>
    </Popover>
  ),
};
