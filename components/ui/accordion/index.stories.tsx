import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from ".";

const meta: Meta<typeof Accordion> = {
  title: "ui/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Default accordion with multiple items
export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          <p>
            This is the content of Section 1. You can put any React nodes here, like text,
            images, or other components.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          <p>
            Section 2 content goes here. Accordion allows multiple items, but this example
            is set to "single" mode.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          <p>
            Section 3 content. You can customize the styling, add lists, buttons, or any other
            elements.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Accordion with multiple open items
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>
          <p>This item can be opened along with others in "multiple" mode.</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          <p>Second item content. Users can expand multiple items at the same time.</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>
          <p>Third item content, same as others. Great for FAQs or collapsible panels.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
