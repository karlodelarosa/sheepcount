"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/mobile" })
      .catch(() => {
        // Installability is a progressive enhancement, not required to use the app.
      });
  }, []);

  return null;
}
