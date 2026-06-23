import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchableSelect } from "./index";

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
