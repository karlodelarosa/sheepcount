"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { RadioGroup, RadioGroupItem } from "./index";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Default selected radio value",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="option-1" {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("apple");

    return (
      <div className="flex flex-col gap-4">
        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          className="gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="apple" id="apple" />
            <Label htmlFor="apple">Apple</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="banana" id="banana" />
            <Label htmlFor="banana">Banana</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cherry" id="cherry" />
            <Label htmlFor="cherry">Cherry</Label>
          </div>
        </RadioGroup>

        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selected}</span>
        </p>
      </div>
    );
  },
};

export const DisabledOptions: Story = {
  render: () => (
    <RadioGroup defaultValue="b">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="a" id="a" />
        <Label htmlFor="a">Option A</Label>
      </div>
      <div className="flex items-center space-x-2 opacity-60">
        <RadioGroupItem value="b" id="b" disabled />
        <Label htmlFor="b">Option B (disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="c" id="c" />
        <Label htmlFor="c">Option C</Label>
      </div>
    </RadioGroup>
  ),
};
