import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./index";

const meta: Meta<typeof AlertDialog> = {
  title: "ui/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: args => (
    <AlertDialog {...args}>
      <AlertDialogTrigger>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Open Dialog</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Default Alert</AlertDialogTitle>
          <AlertDialogDescription>
            This is a simple alert dialog. You can customize it as needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const LongMessage: Story = {
  render: args => (
    <AlertDialog {...args}>
      <AlertDialogTrigger>
        <button className="px-4 py-2 bg-red-500 text-white rounded">Open Alert</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Notice</AlertDialogTitle>
          <AlertDialogDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum, lorem sit amet
            dapibus tincidunt, mauris sapien consequat erat, nec gravida risus magna sit amet erat.
            This is a longer message to test overflow and scrolling behavior inside the alert dialog
            content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction>Agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
