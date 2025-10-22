import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./index";

const meta: Meta<typeof Carousel> = {
  title: "ui/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A carousel component using Embla Carousel. Supports horizontal and vertical orientation, keyboard navigation, and previous/next controls.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: { type: "radio" },
      options: ["horizontal", "vertical"],
      description: "Direction of the carousel",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Carousel>;

const sampleSlides = [
  { id: 1, color: "bg-red-400", label: "Slide 1" },
  { id: 2, color: "bg-green-400", label: "Slide 2" },
  { id: 3, color: "bg-blue-400", label: "Slide 3" },
  { id: 4, color: "bg-yellow-400", label: "Slide 4" },
];

export const Default: Story = {
  args: {
    orientation: "horizontal",
    className: "h-48",
  },
  render: args => (
    <div className="relative w-full max-w-xl mx-auto">
      <Carousel {...args}>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselContent className="flex gap-4">
          {sampleSlides.map(slide => (
            <CarouselItem
              key={slide.id}
              className={`flex items-center justify-center rounded-lg text-white font-bold ${slide.color}`}
            >
              {slide.label}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    className: "h-96 w-64",
  },
  render: args => (
    <div className="relative mx-auto">
      <Carousel {...args}>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselContent className="flex flex-col gap-4">
          {sampleSlides.map(slide => (
            <CarouselItem
              key={slide.id}
              className={`flex items-center justify-center rounded-lg text-white font-bold h-32 ${slide.color}`}
            >
              {slide.label}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};
