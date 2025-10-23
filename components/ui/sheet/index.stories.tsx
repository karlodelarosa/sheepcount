"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./index";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

// Wrap story in full-screen container to make fixed Sheet visible
const FullScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-screen w-screen flex items-center justify-center">{children}</div>
);

export const Default: Story = {
  render: () => (
    <FullScreenWrapper>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>
              This is a description for the sheet.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 p-4">
            <p>
              Here’s some content inside the sheet. You can place forms, text, or
              anything else here.
            </p>
          </div>
          <SheetFooter>
            <Button>Confirm</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </FullScreenWrapper>
  ),
};

export const FromLeft: Story = {
  render: () => (
    <FullScreenWrapper>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Left Sheet</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-4">
            <p>Content sliding in from the left.</p>
          </div>
          <SheetFooter>
            <Button>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </FullScreenWrapper>
  ),
};

export const FromTop: Story = {
  render: () => (
    <FullScreenWrapper>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Top Sheet</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-4">
            <p>Content sliding in from the top.</p>
          </div>
        </SheetContent>
      </Sheet>
    </FullScreenWrapper>
  ),
};

export const FromBottom: Story = {
  render: () => (
    <FullScreenWrapper>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Bottom Sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-4">
            <p>Content sliding in from the bottom.</p>
          </div>
          <SheetFooter>
            <Button>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </FullScreenWrapper>
  ),
};
