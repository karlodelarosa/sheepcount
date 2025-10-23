import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertTitle, AlertDescription } from "./index";

const meta: Meta<typeof Alert> = {
  title: "ui/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["default", "destructive"] },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  render: args => (
    <Alert {...args}>
      <AlertTitle>Notice</AlertTitle>
      <AlertDescription>
        This is a default alert. Use it to show important information.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: args => (
    <Alert {...args}>
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const LongMessage: Story = {
  args: {
    variant: "default",
  },
  render: args => (
    <Alert {...args}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum,
        lorem sit amet dapibus tincidunt, mauris sapien consequat erat, nec
        gravida risus magna sit amet erat. This shows how alerts behave with
        longer content.
      </AlertDescription>
    </Alert>
  ),
};
