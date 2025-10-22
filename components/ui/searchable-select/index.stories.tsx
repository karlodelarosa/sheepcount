import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchableSelect } from ".";

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

// Default searchable select
export const Default: Story = {
  args: {
    options: ["Apple", "Banana", "Blueberry", "Cherry", "Date", "Grape"],
    placeholder: "Select a fruit",
  },
};

// Pre-selected value
export const DefaultValue: Story = {
  args: {
    options: ["Apple", "Banana", "Blueberry", "Cherry", "Date", "Grape"],
    placeholder: "Select a fruit",
    value: "Cherry",
    onValueChange: (val: string) => console.log("Selected:", val),
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    options: ["Apple", "Banana", "Blueberry", "Cherry", "Date", "Grape"],
    placeholder: "Select a fruit",
    value: "",
    onValueChange: () => {},
    className: "opacity-50 cursor-not-allowed",
  },
};
