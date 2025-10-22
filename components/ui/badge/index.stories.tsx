// Badge.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./index";

const meta: Meta<typeof Badge> = {
  title: "ui/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    asChild: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Default badge
export const Default: Story = {
  args: {
    children: "Default Badge",
    variant: "default",
    asChild: false,
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    children: "Secondary Badge",
    variant: "secondary",
  },
};

// Destructive variant
export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Badge",
    variant: "outline",
  },
};

export const AsChildExample: Story = {
  args: {
    asChild: true,
    children: (
      <button className="px-2 py-1 rounded bg-gray-200">Button Badge</button>
    ),
  },
};
