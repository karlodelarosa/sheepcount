"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { getGradients } from "@/app/helpers";

// function getGradientClass(initials?: string) {
//   const gradients = [
//     "from-blue-600 to-blue-800 dark:from-blue-300 dark:to-blue-400",
//     "from-orange-600 to-orange-800 dark:from-orange-300 dark:to-orange-400",
//     "from-emerald-600 to-emerald-800 dark:from-emerald-300 dark:to-emerald-400",
//     "from-purple-600 to-purple-800 dark:from-purple-300 dark:to-purple-400",
//     "from-pink-600 to-pink-800 dark:from-pink-300 dark:to-pink-400",
//     "from-yellow-500 to-amber-600 dark:from-yellow-200 dark:to-yellow-300 text-black",
//     "from-teal-600 to-teal-800 dark:from-teal-300 dark:to-teal-400",
//   ];

//   if (!initials) return gradients[0];

//   const sum = initials
//     .split("")
//     .reduce((acc, char) => acc + char.charCodeAt(0), 0);

//   return gradients[sum % gradients.length];
// }

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
}

type AvatarInitialProps = {
  initials: string;
};

function AvatarInitial({ initials }: AvatarInitialProps) {
  const gradient = getGradients(initials);

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full font-medium bg-gradient-to-br text-white dark:text-slate-900",
        gradient,
      )}
    >
      {initials.toUpperCase()}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarInitial };
