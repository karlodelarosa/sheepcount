"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function BubbleButton({ label = "Launch" }) {
  const [particles, setParticles] = useState<number[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    // spawn 10–12 bubbles
    const ids = Array.from({ length: 12 }, (_, i) => i + Math.random());
    setParticles(ids);
    setTimeout(() => setParticles([]), 800);
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: 1.08 }}
      animate={{
        scale: isPressed ? 0.92 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 14,
      }}
      className="relative overflow-hidden px-10 py-4 rounded-xl text-white font-semibold tracking-wide bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg select-none"
    >
      {/* floating particles burst */}
      {particles.map((id) => (
        <motion.span
          key={id}
          className="absolute w-2 h-2 rounded-full bg-white/70"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0.8,
          }}
          animate={{
            x: (Math.random() - 0.5) * 150, // farther outside
            y: (Math.random() - 0.5) * 150,
            opacity: 0,
            scale: Math.random() * 1.8 + 0.8,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          style={{
            left: "50%",
            top: "50%",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* sparkle effect */}
      <motion.span
        key={particles.length}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 0.8], opacity: [0, 1, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute w-2 h-2 rounded-full bg-white"
        style={{
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 14px rgba(255,255,255,0.6)",
          pointerEvents: "none",
        }}
      />

      {/* glow ring */}
      <motion.div
        className="absolute inset-0 rounded-xl ring-2 ring-white/30 blur-sm pointer-events-none"
        animate={{ opacity: isPressed ? 0.4 : 0.9, scale: isPressed ? 0.96 : 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
