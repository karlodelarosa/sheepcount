import { cva, type VariantProps } from "class-variance-authority";

const accentSurfaceVariants = cva("", {
  variants: {
    tone: {
      solid: "bg-[var(--accent-color)] text-[var(--accent-color-foreground)]",
      soft: "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
      gradient:
        "bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color-strong)] text-[var(--accent-color-foreground)]",
    },
  },
  defaultVariants: {
    tone: "solid",
  },
});

type AccentSurfaceVariantProps = VariantProps<typeof accentSurfaceVariants>;

export { accentSurfaceVariants, type AccentSurfaceVariantProps };
