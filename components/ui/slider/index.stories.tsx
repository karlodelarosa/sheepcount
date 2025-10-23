// Slider.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { Slider } from "./index";
import { Button } from "@/components/ui/button/index";

const meta: Meta<typeof Slider> = {
  title: "ui/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => <Slider />,
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([25, 75]);
    return (
      <div className="w-80">
        <Slider value={value} onValueChange={setValue} />
        <div className="mt-2 text-sm text-gray-500">
          Current value: {value.join(" - ")}
        </div>
      </div>
    );
  },
};

export const SingleValue: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-80">
        <Slider value={value} onValueChange={setValue} />
        <div className="mt-2 text-sm text-gray-500">
          Current value: {value[0]}
        </div>
      </div>
    );
  },
};

export const MinMax: Story = {
  render: () => {
    const [value, setValue] = useState([10, 90]);
    return (
      <div className="w-80">
        <Slider min={0} max={100} value={value} onValueChange={setValue} />
        <div className="mt-2 text-sm text-gray-500">
          Range: {value[0]} - {value[1]}
        </div>
      </div>
    );
  },
};
