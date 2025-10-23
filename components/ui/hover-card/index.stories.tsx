import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./index";
import Image from "next/image";

const meta: Meta<typeof HoverCard> = {
  title: "UI/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <div className="flex justify-center py-20">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
            Hover me
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex space-x-4">
            <Image
              src="https://github.com/shadcn.png"
              alt="User avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div className="space-y-1">
              <h4 className="font-semibold leading-none">shadcn</h4>
              <p className="text-sm text-muted-foreground">
                Creator of shadcn/ui — Beautifully designed components built with Radix UI and Tailwind CSS.
              </p>
              <a
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm font-medium hover:underline"
              >
                Visit Website →
              </a>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};
