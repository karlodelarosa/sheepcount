"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { ScrollArea, ScrollBar } from "./index";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Vertical: Story = {
  render: () => (
    <div className="h-64 w-64 border">
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="h-8 w-full rounded bg-slate-200 flex items-center justify-center"
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="h-32 w-full border">
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="flex gap-2 p-4 w-max">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="w-32 h-20 rounded bg-slate-300 flex items-center justify-center"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  ),
};

export const MixedContent: Story = {
  render: () => (
    <div className="h-64 w-96 border">
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="flex flex-col gap-4 p-4">
          <div className="h-20 rounded bg-slate-100 flex items-center justify-center">
            Header
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="w-32 h-20 rounded bg-slate-200 flex items-center justify-center"
              >
                Card {i + 1}
              </div>
            ))}
          </div>
          <div className="h-32 rounded bg-slate-300 flex items-center justify-center">
            Footer
          </div>
        </div>
      </ScrollArea>
    </div>
  ),
};
