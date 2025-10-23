// ToggleGroup.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./index";

const meta: Meta<typeof ToggleGroup> = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

// Default toggle group
export const Default: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue="1"
      aria-label="Default Toggle Group"
    >
      <ToggleGroupItem value="1">Option 1</ToggleGroupItem>
      <ToggleGroupItem value="2">Option 2</ToggleGroupItem>
      <ToggleGroupItem value="3">Option 3</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Multiple selection group
export const Multiple: Story = {
  render: () => (
    <ToggleGroup
      type="multiple"
      defaultValue={["1", "3"]}
      aria-label="Multiple Toggle Group"
    >
      <ToggleGroupItem value="1">Option 1</ToggleGroupItem>
      <ToggleGroupItem value="2">Option 2</ToggleGroupItem>
      <ToggleGroupItem value="3">Option 3</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Outline variant group
export const OutlineVariant: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      variant="outline"
      defaultValue="2"
      aria-label="Outline Toggle Group"
    >
      <ToggleGroupItem value="1">Option 1</ToggleGroupItem>
      <ToggleGroupItem value="2">Option 2</ToggleGroupItem>
      <ToggleGroupItem value="3">Option 3</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Small size group
export const Small: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      size="sm"
      defaultValue="1"
      aria-label="Small Toggle Group"
    >
      <ToggleGroupItem value="1">Option 1</ToggleGroupItem>
      <ToggleGroupItem value="2">Option 2</ToggleGroupItem>
      <ToggleGroupItem value="3">Option 3</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Interactive group with state
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<string>("1");

    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={setValue}
        aria-label="Interactive Toggle Group"
      >
        <ToggleGroupItem value="1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="2">Option 2</ToggleGroupItem>
        <ToggleGroupItem value="3">Option 3</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};
