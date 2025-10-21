import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./index";

const meta: Meta<typeof Label> = {
  title: "ui/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    htmlFor: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Username",
    htmlFor: "username",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Label",
    htmlFor: "disabled",
    className: "opacity-50 cursor-not-allowed",
  },
};
