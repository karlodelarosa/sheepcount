"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  keywords?: string;
  disabled?: boolean;
};

export type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  id?: string;
  disabled?: boolean;
  emptyMessage?: string;
  pinnedOptions?: SearchableSelectOption[];
};

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  triggerClassName,
  id,
  disabled,
  emptyMessage = "No results found",
  pinnedOptions = [],
}: SearchableSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pinnedValues = new Set(pinnedOptions.map(option => option.value));
    return options.filter(
      option =>
        !pinnedValues.has(option.value) &&
        `${option.label} ${option.keywords ?? ""}`
          .toLowerCase()
          .includes(query),
    );
  }, [options, pinnedOptions, search]);
  const selected = [...pinnedOptions, ...options].find(
    option => option.value === value,
  );

  return (
    <Popover
      modal
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", triggerClassName)}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[100] w-[var(--radix-popover-trigger-width)] min-w-48 overflow-hidden p-0"
        onOpenAutoFocus={event => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          <CommandList className="max-h-[min(400px,calc(var(--radix-popover-content-available-height)-48px))] touch-pan-y overscroll-contain">
            <CommandGroup>
              {[...pinnedOptions, ...filteredOptions].map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => {
                    onValueChange?.(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="flex-1">{option.label}</span>
                  {value === option.value && <Check className="size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {pinnedOptions.length + filteredOptions.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
