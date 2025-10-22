import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AspectRatio } from "./index";

const meta: Meta<typeof AspectRatio> = {
  title: "ui/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: { control: "number" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: args => (
    <AspectRatio {...args} className="w-64 bg-gray-200">
      <div className="bg-blue-500 flex items-center justify-center text-white">
        Content
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 16 / 9,
  },
};

export const Square: Story = {
  render: args => (
    <AspectRatio {...args} className="w-48 bg-gray-200">
      <div className="bg-green-500 flex items-center justify-center text-white">
        Square
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 1,
  },
};

export const Tall: Story = {
  render: args => (
    <AspectRatio {...args} className="w-32 bg-gray-200">
      <div className="bg-red-500 flex items-center justify-center text-white">
        Tall
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 9 / 16,
  },
};
