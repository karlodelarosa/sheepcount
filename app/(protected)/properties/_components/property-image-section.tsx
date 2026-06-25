"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChurchProperty } from "@/lib/supabase/properties";

export function propertyToUpdateInput(property: ChurchProperty) {
  return {
    id: property.id,
    name: property.name,
    propertyTypeId: property.propertyTypeId,
    imageUrl: property.imageUrl,
    purchaseDate: property.purchaseDate,
    estimatedValue: property.estimatedValue,
    status: property.status,
    description: property.description,
    notes: property.notes,
  };
}

export function PropertyImageSection({
  property,
  isAdmin,
  onUpload,
  isSaving = false,
  className,
}: {
  property: ChurchProperty;
  isAdmin: boolean;
  onUpload: (file: File) => Promise<unknown>;
  isSaving?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const busy = isSaving || isUploading;

  const handleFile = async (file: File | null) => {
    if (!file || !isAdmin) return;
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative aspect-square bg-slate-50 dark:bg-zinc-900", className)}>
      {property.imageUrl ? (
        <Image
          src={property.imageUrl}
          alt={property.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
          <ImagePlus className="w-12 h-12" />
          <span className="text-sm">No image yet</span>
        </div>
      )}

      {isAdmin && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={busy}
            onChange={e => void handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-lg bg-white/95 text-slate-900 shadow-sm hover:bg-white"
              disabled={busy}
              title={property.imageUrl ? "Change image" : "Upload image"}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
