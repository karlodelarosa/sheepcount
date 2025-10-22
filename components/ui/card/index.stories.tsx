import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./index";
import { Button } from "../button";

const meta: Meta<typeof Card> = {
  title: "ui/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible Card component with slots for header, content, footer, and actions. Works well with Buttons and other UI elements.",
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional classes for the card container",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

// ----- Default Card -----
export const Default: Story = {
  args: {
    className: "w-[300px]",
  },
  render: args => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a description for the card. It supports multiple lines and
          additional info.
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="secondary">
            Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

// ----- Card Without Action -----
export const WithoutAction: Story = {
  args: {
    className: "w-[300px]",
  },
  render: args => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This card does not have an action button in the header.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          You can put any content here. For example, text, images, or other
          components.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Close
        </Button>
      </CardFooter>
    </Card>
  ),
};

// ----- Card With Long Content -----
export const LongContent: Story = {
  args: {
    className: "w-[400px]",
  },
  render: args => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card With Long Content</CardTitle>
        <CardDescription>
          This card demonstrates wrapping and spacing for longer content blocks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
          sagittis, nisl nec ullamcorper sodales, enim nisl tincidunt ex, sed
          porttitor sapien arcu eget libero. Suspendisse potenti. Integer
          ultricies purus a felis ultrices, in dapibus mi vehicula. Donec nec
          purus vitae urna faucibus malesuada.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button size="sm">Ok</Button>
      </CardFooter>
    </Card>
  ),
};
