"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PhotoUploadField({
  label = "Photo (optional)",
  alt = "Preview",
  currentImageUrl,
  onFileChange,
  disabled,
}: {
  label?: string;
  alt?: string;
  currentImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  const displayUrl = cleared ? null : (previewUrl ?? currentImageUrl ?? null);

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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50 flex items-center justify-center dark:border-zinc-700/70 dark:bg-zinc-900",
            !displayUrl && "border-dashed",
          )}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={alt}
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
            size="sm"
            className="rounded-lg"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {displayUrl ? "Change photo" : "Upload photo"}
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
          <p className="text-xs text-slate-500">
            JPEG, PNG, WebP, or GIF up to 5 MB
          </p>
        </div>
      </div>
    </div>
  );
}
