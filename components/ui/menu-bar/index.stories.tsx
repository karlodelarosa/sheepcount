import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "./index";

const meta: Meta<typeof Menubar> = {
  title: "UI/Menubar",
  component: Menubar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => {
    const [bookmarksVisible, setBookmarksVisible] = useState(true);
    const [urlsVisible, setUrlsVisible] = useState(false);
    const [person, setPerson] = useState("pedro");

    return (
      <div className="flex justify-center py-10">
        <Menubar>
          {/* FILE MENU */}
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab</MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* EDIT MENU */}
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarContent>
          </MenubarMenu>

          {/* VIEW MENU */}
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem
                checked={bookmarksVisible}
                onCheckedChange={setBookmarksVisible}
              >
                Show Bookmarks
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={urlsVisible}
                onCheckedChange={setUrlsVisible}
              >
                Show Full URLs
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Zoom</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Zoom In</MenubarItem>
                  <MenubarItem>Zoom Out</MenubarItem>
                  <MenubarItem>Reset Zoom</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          {/* PEOPLE MENU */}
          <MenubarMenu>
            <MenubarTrigger>Profiles</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={person} onValueChange={setPerson}>
                <MenubarRadioItem value="pedro">Pedro Duarte</MenubarRadioItem>
                <MenubarRadioItem value="colm">Colm Tuite</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    );
  },
};
