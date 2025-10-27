import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const GRADIENTS = [
  "bg-gradient-1",
  "bg-gradient-2",
  "bg-gradient-3",
  "bg-gradient-4",
  "bg-gradient-5",
  "bg-gradient-6",
  "bg-gradient-7",
  "bg-gradient-8",
  "bg-gradient-9",
  "bg-gradient-10",
  "bg-gradient-11",
  "bg-gradient-12",
  "bg-gradient-13",
  "bg-gradient-14",
  "bg-gradient-15",
  "bg-gradient-16",
];

const meta = {
  title: "Design/Gradients",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllGradients: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-8 p-8 bg-white dark:bg-neutral-900">
      {GRADIENTS.map((g, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className={`w-20 h-20 rounded-lg ${g}`} />
          <span className="text-xs text-neutral-700 dark:text-neutral-300">{g}</span>
        </div>
      ))}
    </div>
  ),
};
