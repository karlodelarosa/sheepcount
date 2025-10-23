import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./index";
import React from "react";

const meta: Meta<typeof Checkbox> = {
  title: "ui/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A customizable checkbox built with **Radix UI** and styled to match your theme.

Supports all native checkbox props (e.g., \`checked\`, \`disabled\`, \`onCheckedChange\`).
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// =======================
// DEFAULT CHECKBOX
// =======================
export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="default" />
      <label htmlFor="default" className="text-sm">
        Default Checkbox
      </label>
    </div>
  ),
};

// =======================
// CHECKED (Controlled)
// =======================
export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="checked" checked={checked} onCheckedChange={setChecked} />
        <label htmlFor="checked" className="text-sm">
          Controlled Checkbox ({checked ? "checked" : "unchecked"})
        </label>
      </div>
    );
  },
};

// =======================
// DISABLED
// =======================
export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled checked />
      <label htmlFor="disabled" className="text-sm text-muted-foreground">
        Disabled Checkbox
      </label>
    </div>
  ),
};

// =======================
// VARIANTS
// =======================
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox className="size-3" />
        <span className="text-xs">Small (size-3)</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox className="size-4" />
        <span className="text-sm">Default (size-4)</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox className="size-5" />
        <span className="text-base">Large (size-5)</span>
      </div>
    </div>
  ),
};
