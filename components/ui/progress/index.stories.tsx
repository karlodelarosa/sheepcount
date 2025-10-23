"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Progress } from "./index";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: {
    value: 50,
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: args => <Progress {...args} />,
};

export const AnimatedProgress: Story = {
  render: () => {
    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setValue(v => (v >= 100 ? 0 : v + 10));
      }, 800);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="flex flex-col gap-3 w-64">
        <Progress value={value} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      </div>
    );
  },
};

export const ControlledProgress: Story = {
  render: () => {
    const [value, setValue] = React.useState(40);

    return (
      <div className="flex flex-col gap-3 w-64">
        <Progress value={value} />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setValue(v => Math.max(0, v - 10))}>
            -
          </Button>
          <span className="text-sm text-muted-foreground">{value}%</span>
          <Button
            size="sm"
            onClick={() => setValue(v => Math.min(100, v + 10))}
          >
            +
          </Button>
        </div>
      </div>
    );
  },
};
