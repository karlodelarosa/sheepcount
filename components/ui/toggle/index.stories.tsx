// Toggle.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { Toggle } from "./index";
import { Check } from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

// Default toggle
export const Default: Story = {
  render: () => <Toggle>Toggle</Toggle>,
};

// Toggle with outline variant
export const Outline: Story = {
  render: () => <Toggle variant="outline">Outline</Toggle>,
};

// Small toggle
export const Small: Story = {
  render: () => <Toggle size="sm">Small</Toggle>,
};

// Large toggle
export const Large: Story = {
  render: () => <Toggle size="lg">Large</Toggle>,
};

// Toggle with icon
export const WithIcon: Story = {
  render: () => (
    <Toggle>
      <Check className="size-4" />
    </Toggle>
  ),
};

// Toggle interactive group
export const ToggleGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle>Option 1</Toggle>
      <Toggle>Option 2</Toggle>
      <Toggle>Option 3</Toggle>
    </div>
  ),
};
