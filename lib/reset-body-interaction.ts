/** Clears stale Radix modal styles that can block page interaction after close. */
export function resetBodyInteraction() {
  if (typeof document === "undefined") return;

  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.body.removeAttribute("data-scroll-locked");
}

/** Run after Radix close animations / layer teardown (next frame). */
export function resetBodyInteractionDeferred() {
  if (typeof window === "undefined") return;

  requestAnimationFrame(() => {
    resetBodyInteraction();
  });
}
