import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar } from "./index";

const meta: Meta<typeof Calendar> = {
  title: "ui/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["single", "multiple", "range"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: args => <Calendar {...args} />,
};

export const RangeSelection: Story = {
  render: args => <Calendar {...args} mode="range" />,
};

export const MultipleSelection: Story = {
  render: args => <Calendar {...args} mode="multiple" />,
};
