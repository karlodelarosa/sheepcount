"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  options: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  className,
}: SearchableSelectProps) {
  const [filter, setFilter] = React.useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "border-input flex w-full items-center justify-between rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 disabled:opacity-50",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="absolute mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50 max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded border p-1 text-sm outline-none"
            />
          </div>

          <SelectPrimitive.Viewport>
            {filteredOptions.map((opt) => (
              <SelectPrimitive.Item
                key={opt}
                value={opt} // ✅ Must have value
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none rounded hover:bg-accent hover:text-accent-foreground"
              >
                <SelectPrimitive.ItemText>{opt}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <CheckIcon className="size-4 opacity-50" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
