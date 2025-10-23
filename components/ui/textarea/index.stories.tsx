// Textarea.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { Textarea } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => <Textarea placeholder="Type something..." />,
};

export const WithValue: Story = {
  render: () => <Textarea defaultValue="This is some default text." />,
};

export const Disabled: Story = {
  render: () => <Textarea placeholder="Can't type here..." disabled />,
};

export const ErrorState: Story = {
  render: () => <Textarea placeholder="This has an error" aria-invalid />,
};
