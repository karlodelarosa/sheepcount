"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Hero from ".";
import { HomeIcon, UserIcon, MusicIcon } from "lucide-react";

const menuItems = [
  { label: "Home", icon: HomeIcon },
  { label: "About", icon: UserIcon },
  { label: "Music", icon: MusicIcon },
];

function AnimatedMenu() {
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    menuRefs.current.forEach((ref, i) => {
      if (!ref) return;
      gsap.fromTo(
        ref,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: i * 0.12,
          ease: "back.out(1.6)",
        }
      );
    });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-start justify-center z-20"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{ pointerEvents: "none" }}
    >
      <div
        className="rounded-xl px-6 py-3 flex flex-row gap-x-8 "
        style={{ pointerEvents: "auto" }}
      >
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              ref={(el) => {
                menuRefs.current[idx] = el;
                return null;
              }}
              className="relative p-3 cursor-pointer text-white/90 rounded-lg outline-none select-none flex flex-col items-center justify-center"
              whileHover={{
                scale: 1.2,
                color: "#f472b6",
                textShadow: "0 0 8px rgba(255,192,203,0.8)",
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{
                scale: 0.95,
                rotate: 0,
                color: "#a5b4fc",
                textShadow: "0 0 4px rgba(128,0,128,0.5)",
              }}
              tabIndex={0}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
            >
              <Icon 
                className="w-6 h-6 mb-1 transition-all duration-200" 
                style={{
                  background: "linear-gradient(45deg, #f472b6, #a5b4fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  }}
              />
              {/* <span className="text-xs">{item.label}</span> */}
              {/* Optional hover glow */}
              <motion.div
                className="absolute w-full h-full top-0 left-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "0 0 20px rgba(255,192,203,0.4)",
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <AnimatedMenu />
      <Hero />
    </div>
  );
}
