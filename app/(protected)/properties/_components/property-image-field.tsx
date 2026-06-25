"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PropertyImageField({
  currentImageUrl,
  onFileChange,
  disabled,
  variant = "compact",
}: {
  currentImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  variant?: "compact" | "large";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  const displayUrl = cleared ? null : previewUrl ?? currentImageUrl ?? null;

  const handleFile = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setCleared(false);
      onFileChange(file);
      return;
    }
    setPreviewUrl(null);
    setCleared(true);
    onFileChange(null);
  };

  const isLarge = variant === "large";
  const previewSize = isLarge ? "h-40 w-40" : "h-24 w-24";

  return (
    <div className="space-y-2">
      <Label>Image (optional)</Label>
      <div className={cn("flex items-start gap-4", isLarge && "flex-col sm:flex-row")}>
        <div
          className={cn(
            "relative rounded-xl border border-slate-200/70 dark:border-zinc-700/70 overflow-hidden bg-slate-50 dark:bg-zinc-900 flex items-center justify-center shrink-0",
            previewSize,
            !displayUrl && "border-dashed",
          )}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Property preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImagePlus className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled}
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size={isLarge ? "default" : "sm"}
            className="rounded-lg"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {displayUrl ? "Change image" : "Upload image"}
          </Button>
          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg text-slate-500"
              disabled={disabled}
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                handleFile(null);
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
          <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF up to 5 MB</p>
        </div>
      </div>
    </div>
  );
}
