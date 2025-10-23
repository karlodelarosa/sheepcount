// Sidebar.stories.tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "./index";

const meta: Meta<typeof Sidebar> = {
  title: "ui/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen">
        {/* Sidebar */}
        <Sidebar side="left" collapsible="offcanvas" variant="sidebar">
          <SidebarHeader>
            <h2 className="text-lg font-bold">Sidebar Header</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Settings</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Profile</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-gray-400">Footer content</p>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 p-4">
          <SidebarTrigger className="mb-4" />
          <p>Main page content goes here...</p>
        </div>
      </div>
    </SidebarProvider>
  ),
};
