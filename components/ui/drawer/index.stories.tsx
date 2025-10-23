import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./index";

const meta: Meta<typeof Drawer> = {
  title: "ui/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
          Open Drawer
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            This is an example of a bottom drawer using Vaul.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          <p>
            You can place any custom content here such as forms, links, or other
            components.
          </p>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
              Close
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
