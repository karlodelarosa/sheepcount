"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Separator } from "./index";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64 p-4 border">
      <div className="p-2 bg-slate-100 text-center">Section 1</div>
      <Separator orientation="horizontal" />
      <div className="p-2 bg-slate-200 text-center">Section 2</div>
      <Separator orientation="horizontal" />
      <div className="p-2 bg-slate-300 text-center">Section 3</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex flex-row gap-4 w-96 h-32 p-4 border">
      <div className="flex-1 bg-slate-100 flex items-center justify-center">Left</div>
      <Separator orientation="vertical" />
      <div className="flex-1 bg-slate-200 flex items-center justify-center">Center</div>
      <Separator orientation="vertical" />
      <div className="flex-1 bg-slate-300 flex items-center justify-center">Right</div>
    </div>
  ),
};

export const CustomStyles: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64 p-4 border">
      <div className="p-2 bg-slate-100 text-center">Top</div>
      <Separator className="bg-red-500" />
      <div className="p-2 bg-slate-200 text-center">Middle</div>
      <Separator className="bg-green-500" />
      <div className="p-2 bg-slate-300 text-center">Bottom</div>
    </div>
  ),
};
