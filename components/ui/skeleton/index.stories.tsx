import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "@/components/ui/skeleton/index";

const meta: Meta<typeof Skeleton> = {
  title: "ui/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: (args) => <Skeleton {...args} className="h-6 w-32" />,
};

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-full" />
    </div>
  ),
};
