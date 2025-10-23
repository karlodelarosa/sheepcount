// Toaster.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { Toaster } from "./index";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const meta: Meta<typeof Toaster> = {
  title: "ui/Toaster",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const WithButtons: Story = {
  render: () => (
    <div className="space-y-2">
      <Button onClick={() => toast("Normal toast")}>Normal Toast</Button>
      <Button onClick={() => toast.success("Success toast")}>Success Toast</Button>
      <Button onClick={() => toast.error("Error toast")}>Error Toast</Button>
      <Button onClick={() => toast("Custom toast", { description: "With description" })}>
        With Description
      </Button>

      <Toaster
        // Set colors for each variant
        toastOptions={{
          style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",

            "--success-bg": "var(--green-500)",
            "--success-text": "white",
            "--success-border": "var(--green-700)",

            "--error-bg": "var(--red-500)",
            "--error-text": "white",
            "--error-border": "var(--red-700)",
          } as React.CSSProperties,
        }}
      />
    </div>
  ),
};
