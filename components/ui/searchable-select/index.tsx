"use client";

import { useRef, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  pinnedOptions,
}: SearchableSelectProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) return options;
    return options.filter(option => {
      const haystack = `${option.label} ${option.keywords ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [options, normalizedSearch]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const showEmptyState =
    filteredOptions.length === 0 && (!pinnedOptions || pinnedOptions.length === 0);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        onCloseAutoFocus={event => event.preventDefault()}
        onOpenAutoFocus={event => {
          event.preventDefault();
          searchInputRef.current?.focus();
        }}
      >
        <div
          className="border-b p-2"
          onPointerDown={event => event.stopPropagation()}
        >
          <Input
            ref={searchInputRef}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-8"
            onKeyDown={event => event.stopPropagation()}
          />
        </div>
        {pinnedOptions?.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
        {showEmptyState ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          filteredOptions.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
