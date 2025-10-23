"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../button";

type DateRange = { from: Date; to?: Date };

export type CalendarProps =
  | (DayPickerProps & { mode: "single"; selected?: Date })
  | (DayPickerProps & { mode: "multiple"; selected?: Date[] })
  | (DayPickerProps & { mode: "range"; selected?: { from?: Date; to?: Date } });

export function Calendar({
  selected,
  className,
  classNames,
  showOutsideDays = true,
  mode,
  ...props
}: CalendarProps) {
  const today = new Date();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-max">
      <DayPicker
        mode={mode}
        showOutsideDays={showOutsideDays}
        disabled={{ before: today }}
        modifiers={{
          past: { before: today },
        }}
        modifiersClassNames={{
          past: "text-gray-300 opacity-70 hover:cursor-not-allowed pointer-events-none",
          ...props.modifiersClassNames,
        }}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-col gap-4",
          month: "flex flex-col gap-2",
          caption: "flex justify-between items-center w-full py-1",
          caption_label: "text-sm font-medium",
          nav: "flex items-center gap-2",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "w-8 h-8 p-0 opacity-60 hover:opacity-100"
          ),
          table: "w-full border-collapse",
          head_row: "grid grid-cols-7",
          head_cell:
            "text-muted-foreground text-center font-medium text-sm py-1",
          row: "grid grid-cols-7 mt-1",
          cell: cn(
            "text-center p-0 relative",
            mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            "w-10 h-10 p-0 font-normal text-sm text-center rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            "aria-selected:bg-primary aria-selected:text-primary-foreground"
          ),
          day_range_start:
            "day-range-start bg-primary text-primary-foreground rounded-l-full",
          day_range_end:
            "day-range-end bg-primary text-primary-foreground rounded-r-full",
          day_range_middle:
            "aria-selected:bg-primary/50 aria-selected:text-primary-foreground",
          day_selected:
            "bg-primary text-primary-foreground rounded-full hover:bg-primary/80",
          day_today: "bg-accent text-accent-foreground rounded-full",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}
