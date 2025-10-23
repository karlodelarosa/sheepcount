// Switch.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { Switch } from "./index";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex items-center space-x-2">
        <Switch
          checked={checked}
          onCheckedChange={(val) => setChecked(val)}
        />
        <Label>{checked ? "On" : "Off"}</Label>
      </div>
    );
  },
};
