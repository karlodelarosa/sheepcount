import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "./index";
import { useState } from "react";
import { FileText, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof CommandDialog> = {
  title: "UI/Command",
  component: CommandDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CommandDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="General">
              <CommandItem>
                <User />
                Profile
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>

              <CommandItem>
                <FileText />
                Documents
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Settings">
              <CommandItem>
                <Settings />
                Preferences
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
};
