import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar } from "./index";
import type { CalendarProps } from "./index";

const meta: Meta<CalendarProps> = {
  title: "ui/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["single", "multiple", "range"],
    },
    showOutsideDays: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<CalendarProps>;

// Default single-date calendar
export const Default: Story = {
  args: {
    mode: "single",
    selected: undefined,
  },
};

// Range selection
export const RangeSelection: Story = {
  args: {
    mode: "range",
    selected: undefined, // start empty
  },
};

// Multiple selection
export const MultipleSelection: Story = {
  args: {
    mode: "multiple",
    selected: [],
  },
};

// Calendar with min/max date
export const WithMinMax: Story = {
  args: {
    mode: "single",
    selected: undefined,
    fromDate: new Date(2025, 0, 1),
    toDate: new Date(2025, 11, 31),
  },
};

// Calendar with custom styling
export const CustomStyled: Story = {
  args: {
    mode: "single",
    selected: undefined,
    className: "border border-primary shadow-lg",
  },
};
