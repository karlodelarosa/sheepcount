"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { HomeIcon, UserIcon, MusicIcon } from "lucide-react";

export default function ButtonMenu() {
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isInside, setIsInside] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 1200, damping: 50 });
  const springY = useSpring(rawY, { stiffness: 1200, damping: 50 });

  const left = useTransform(springX, (v) => `${v}px`);
  const top = useTransform(springY, (v) => `${v}px`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetFixX = 0;
    const offsetFixY = 0;
    rawX.set(e.clientX - rect.left + offsetFixX);
    rawY.set(e.clientY - rect.top + offsetFixY);
  };

  const menuItems = [
    { label: "Home", icon: HomeIcon },
    { label: "Profile", icon: UserIcon },
    { label: "Music", icon: MusicIcon },
  ];

  return (
    <div className="flex justify-center mt-20">
      <div className="flex gap-8 bg-neutral-900/70 px-10 py-6 rounded-2xl relative">
        {menuItems.map(({ label, icon: Icon }, i) => (
          <div
            key={label}
            className="relative w-20 h-20 flex flex-col items-center justify-center text-white cursor-pointer select-none border rounded-lg overflow-hidden"
            onMouseEnter={() => setActiveButton(i)}
            onMouseLeave={() => {
              setActiveButton(null);
              setIsInside(false);
            }}
            onMouseMove={(e) => {
              if (activeButton === i) {
                setIsInside(true);
                handleMouseMove(e);
              }
            }}
          >
            {/* Follower only on active button */}
            {isInside && activeButton === i && (
              <motion.div
                className="absolute w-10 h-10 rounded-full bg-pink-500/60 pointer-events-none mix-blend-screen blur-md"
                style={{
                  left,
                  top,
                  transform: "translate(-30%, -30%)",
                }}
                animate={{
                  scale: [1, 1.06, 0.96, 1],
                  borderRadius: ["50%", "47%", "53%", "50%"],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            )}

            <motion.div
              whileHover={{
                scale: 1.14,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center z-10"
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
