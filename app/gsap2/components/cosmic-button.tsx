"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all select-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden",
  {
    variants: {
      variant: {
        cosmic:
          "text-white bg-[linear-gradient(90deg,#7b2ff7,#f107a3,#00d4ff)] bg-[length:200%_200%] shadow-[0_0_20px_rgba(147,51,234,0.3)]",
        nebula:
          "text-white/90 border border-white/20 bg-black/30 backdrop-blur-md hover:border-purple-400/40 shadow-[0_0_25px_rgba(139,92,246,0.15)]",
        aurora:
          "bg-gradient-to-br from-indigo-500/30 via-pink-500/20 to-transparent text-white/90 hover:from-indigo-500/50 hover:via-pink-500/30",
        pulse:
          "bg-white/10 text-white/90 border border-white/10 hover:border-white/20 dark:bg-white/5 hover:bg-white/15",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2 text-base",
        lg: "px-7 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "cosmic",
      size: "md",
    },
  }
);

interface CosmicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

export const CosmicButton = React.forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, variant, size, asChild, icon, label, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;

    return (
      <Comp
        ref={ref}
        whileHover={{
          scale: 1.06,
          boxShadow: "0 0 18px rgba(255,255,255,0.25)",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* ✴️ Animated gradient drift for “cosmic” variant */}
        {variant === "cosmic" && (
          <motion.span
            className="absolute inset-0 opacity-70"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            style={{
              background:
                "linear-gradient(90deg,#7b2ff7,#f107a3,#00d4ff,#7b2ff7)",
              backgroundSize: "300% 300%",
            }}
          />
        )}

        {/* 🌫 Floating dust shimmer for “nebula” */}
        {variant === "nebula" && (
          <motion.span
            className="absolute inset-0 pointer-events-none"
            animate={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08), transparent 70%)",
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* 🌈 Moving aurora streak */}
        {variant === "aurora" && (
          <motion.span
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.25) 0%,transparent 50%,rgba(255,255,255,0.25) 100%)",
              backgroundSize: "200% 200%",
            }}
          />
        )}

        {/* ⚡ Pulse glow for “pulse” */}
        {variant === "pulse" && (
          <motion.span
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 10px rgba(255,255,255,0.2)",
                "0 0 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <span className="relative z-10 flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {label || children}
        </span>
      </Comp>
    );
  }
);

CosmicButton.displayName = "CosmicButton";
