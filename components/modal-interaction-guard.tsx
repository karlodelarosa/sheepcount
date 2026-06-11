"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resetBodyInteractionDeferred } from "@/lib/reset-body-interaction";

/** Safety net when navigation or unmount leaves body interaction locked. */
export function ModalInteractionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    resetBodyInteractionDeferred();
  }, [pathname]);

  return null;
}
