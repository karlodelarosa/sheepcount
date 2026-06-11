"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export function GalaxyButton({ label = "Warp Drive" }) {
  const particleLayer = useRef<HTMLDivElement>(null);
  const rippleLayer = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = particleLayer.current;
    const rippleContainer = rippleLayer.current;
    if (!container || !rippleContainer) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ✴️ Create ripple shockwave
    const ripple = document.createElement("div");
    ripple.className =
      "absolute rounded-full bg-white/20 backdrop-blur-sm pointer-events-none";
    ripple.style.left = `${x - 50}px`;
    ripple.style.top = `${y - 50}px`;
    ripple.style.width = "100px";
    ripple.style.height = "100px";
    rippleContainer.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 0.8 },
      {
        scale: 6,
        opacity: 0,
        duration: 1.4,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      }
    );

    // 💥 Sparkle burst
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.className =
        "absolute rounded-full bg-white pointer-events-none shadow-md";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = "6px";
      particle.style.height = "6px";
      container.appendChild(particle);

      gsap.to(particle, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: 0,
        scale: 0,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => particle.remove(),
      });
    }

    // 🪩 Button bounce
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.9 },
      { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" }
    );
  };

  useEffect(() => {
    // 🌌 Ambient background animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(".galaxy-bg", {
      backgroundPosition: "100% 50%",
      duration: 10,
      ease: "linear",
    });

    // 🪐 Floating orbs animation
    const orbs = gsap.utils.toArray<HTMLDivElement>(".orb");
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: Math.sin(i) * 20,
        y: Math.cos(i) * 20,
        repeat: -1,
        yoyo: true,
        duration: 2 + Math.random() * 2,
        ease: "sine.inOut",
      });
    });
  }, []);

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileFocus={{ scale: 1.05 }}
        onClick={handleClick}
        className="relative overflow-hidden px-10 py-4 rounded-full text-white font-bold tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.2)] backdrop-blur-md"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 galaxy-bg bg-[linear-gradient(270deg,#7b2ff7,#f107a3,#00d4ff)] bg-[length:200%_200%] opacity-90 rounded-full" />

        {/* Orbiting orbs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="orb absolute w-2 h-2 rounded-full bg-white/80 blur-[1px]"
              style={{
                transform: `rotate(${i * 72}deg) translate(40px)`,
              }}
            />
          ))}
        </div>

        {/* Label */}
        <span className="relative z-10">{label}</span>

        {/* Ripple and Particle Layers */}
        <div
          ref={rippleLayer}
          className="absolute inset-0 overflow-visible pointer-events-none"
        />
        <div
          ref={particleLayer}
          className="absolute inset-0 overflow-visible pointer-events-none"
        />
      </motion.button>
    </div>
  );
}