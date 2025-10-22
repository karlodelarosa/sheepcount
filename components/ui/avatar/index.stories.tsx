// Avatar.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarImage, AvatarFallback } from "./index";

const meta: Meta<typeof Avatar> = {
  title: "ui/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: args => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/150?img=32" alt="User Avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: args => (
    <Avatar {...args}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  render: args => (
    <Avatar {...args} className="size-16">
      <AvatarImage src="https://i.pravatar.cc/150?img=45" alt="User Avatar" />
      <AvatarFallback>XY</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  render: args => (
    <Avatar {...args} className="size-6">
      <AvatarImage src="https://i.pravatar.cc/150?img=12" alt="User Avatar" />
      <AvatarFallback>LM</AvatarFallback>
    </Avatar>
  ),
};
