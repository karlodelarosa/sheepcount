import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from ".";

const meta = {
  title: "ui/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// Since Tag has no props, no args are needed
export const Default: Story = {};
