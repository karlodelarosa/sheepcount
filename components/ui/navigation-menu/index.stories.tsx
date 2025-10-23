import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from "./index";

const meta: Meta<typeof NavigationMenu> = {
  title: "UI/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => (
    <div className="flex justify-center py-10">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent className="bg-popover text-popover-foreground p-4 rounded-md shadow-md">
              <ul className="grid w-[300px] gap-3">
                <li>
                  <NavigationMenuLink href="#">
                    <div className="text-sm font-medium leading-none">
                      Analytics
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track your data and performance
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#">
                    <div className="text-sm font-medium leading-none">
                      Reports
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generate and export detailed reports
                    </p>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent className="bg-popover text-popover-foreground p-4 rounded-md shadow-md">
              <ul className="grid w-[300px] gap-3">
                <li>
                  <NavigationMenuLink href="#">
                    <div className="text-sm font-medium leading-none">
                      Documentation
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Learn how to use our components and tools
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#">
                    <div className="text-sm font-medium leading-none">
                      Tutorials
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guides to get started
                    </p>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="#" className="px-4 py-2 text-sm">
              About Us
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuIndicator />
        </NavigationMenuList>

        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  ),
};
