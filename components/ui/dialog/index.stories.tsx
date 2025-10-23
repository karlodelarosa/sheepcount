import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./index";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A customizable modal dialog built using Radix UI. Includes header, content, footer, and trigger components.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

// ======================================
// Default Dialog Example
// ======================================
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Open Dialog</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to continue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-sm text-muted-foreground">
            This is an example of dialog content. You can put forms, messages,
            or confirmation actions here.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

// ======================================
// Open by Default Example (for preview)
// ======================================
export const OpenByDefault: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Preview</DialogTitle>
          <DialogDescription>
            This dialog is open by default to show its structure.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-sm text-muted-foreground">
          You can see how the dialog looks when it’s open — without clicking a
          button.
        </div>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
