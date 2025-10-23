"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./index";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "UI/ResizablePanel",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Horizontal: Story = {
  render: () => (
    <div className="h-64 w-full border">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className="flex h-full items-center justify-center bg-slate-200">
            Panel 1
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="flex h-full items-center justify-center bg-slate-300">
            Panel 2
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="h-64 w-64 border">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            Panel 1
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="flex h-full w-full items-center justify-center bg-slate-300">
            Panel 2
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <div className="h-64 w-full border">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className="flex h-full items-center justify-center bg-slate-100">
            Panel 1
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="flex h-full items-center justify-center bg-slate-200">
            Panel 2
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="flex h-full items-center justify-center bg-slate-300">
            Panel 3
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};
