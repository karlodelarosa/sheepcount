import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumbs } from "./index";

const meta: Meta<typeof Breadcrumbs> = {
  title: "ui/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    separator: { control: false }, // custom separators can be added in code
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

const sampleData = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Data", href: "/library/data" },
  { label: "Current Page" }, // last item
];

export const Default: Story = {
  render: args => <Breadcrumbs {...args} data={sampleData} />,
};

export const CustomSeparator: Story = {
  render: args => (
    <Breadcrumbs
      {...args}
      data={sampleData}
      separator={<span className="mx-1">/</span>} // example custom separator
    />
  ),
};
