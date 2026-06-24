"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const hasNavigated = useRef(false);

  useEffect(() => {
    hasNavigated.current = true;
  }, [pathname]);

  const shouldAnimate = hasNavigated.current && !prefersReducedMotion;

  return (
    <motion.div
      key={pathname}
      initial={shouldAnimate ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.50, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-0"
    >
      {children}
    </motion.div>
  );
}
