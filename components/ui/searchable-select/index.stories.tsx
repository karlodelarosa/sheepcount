import { expect, userEvent, within, waitFor } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchableSelect } from "./index";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function SelectorDialog() {
  const [value, setValue] = useState("");
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Choose a person</DialogTitle>
        <DialogDescription>Search the available options.</DialogDescription>
        <SearchableSelect
          options={fruitOptions}
          value={value}
          onValueChange={setValue}
        />
      </DialogContent>
    </Dialog>
  );
}

const fruitOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "grape", label: "Grape" },
];

const meta: Meta<typeof SearchableSelect> = {
  title: "ui/SearchableSelect",
  component: SearchableSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    options: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchableSelect>;

export const Default: Story = {
  args: {
    options: fruitOptions,
    placeholder: "Select a fruit",
  },
};

export const DefaultValue: Story = {
  args: {
    options: fruitOptions,
    placeholder: "Select a fruit",
    value: "cherry",
    onValueChange: (val: string) => console.log("Selected:", val),
  },
};

export const Disabled: Story = {
  args: {
    options: fruitOptions,
    placeholder: "Select a fruit",
    value: "",
    onValueChange: () => {},
    disabled: true,
  },
};

export const InteractionRegression: Story = {
  args: {
    options: Array.from({ length: 80 }, (_, i) => ({
      value: `person-${i}`,
      label: `Person ${i}`,
    })),
    placeholder: "Select a person",
  },
  decorators: [
    Story => (
      <div style={{ overflow: "hidden", height: 48 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    const input = within(document.body).getByPlaceholderText("Search...");
    await userEvent.type(input, "Person 73", { delay: 30 });
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("Person 73");
    const item = within(document.body).getByRole("option", {
      name: "Person 73",
    });
    await expect(item).toBeVisible();
    const popup = input.closest('[data-slot="popover-content"]')!;
    await expect(canvasElement.contains(popup)).toBe(false);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(input).not.toBeInTheDocument());
    await waitFor(() =>
      expect(within(canvasElement).getByRole("combobox")).toHaveFocus(),
    );
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    const list = document.querySelector('[data-slot="command-list"]')!;
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    list.scrollTop = list.scrollHeight;
    await expect(list.scrollTop).toBeGreaterThan(0);
    await userEvent.keyboard("{Escape}");
  },
};

export const InsideDialog: Story = {
  render: () => <SelectorDialog />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open dialog" }),
    );
    const body = within(document.body);
    await userEvent.click(body.getByRole("combobox"));
    const input = body.getByPlaceholderText("Search...");
    await userEvent.type(input, "blue");
    await expect(input).toHaveFocus();
    await userEvent.click(body.getByRole("option", { name: "Blueberry" }));
    await waitFor(() =>
      expect(body.getByRole("combobox")).toHaveTextContent("Blueberry"),
    );
    await expect(body.getByRole("dialog")).toBeVisible();
  },
};
