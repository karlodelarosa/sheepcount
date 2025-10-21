import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./index";

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    placeholder: { control: "text" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Type something...",
    type: "text",
  },
};

export const Password: Story = {
  args: {
    placeholder: "Enter password",
    type: "password",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    type: "text",
    disabled: true,
  },
};
