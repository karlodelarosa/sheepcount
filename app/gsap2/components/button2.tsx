"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export function PlasmaButton({ label = "Ignite" }) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const btn = btnRef.current;
    if (!btn) return;
    gsap.fromTo(
      btn,
      { scale: 0.9, filter: "brightness(2)" },
      {
        scale: 1,
        filter: "brightness(1)",
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
      }
    );
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={handleClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      className="relative overflow-hidden rounded-full px-12 py-4 text-white font-bold bg-[radial-gradient(circle_at_30%_30%,#ff00f0,#2b00ff,#000)] shadow-[0_0_40px_rgba(255,0,255,0.4)]"
    >
      {/* animated aura */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)] blur-xl"
      />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function WaveButton({ label = "Flow" }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { y: 2, scale: 0.96 },
      { y: 0, scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" }
    );
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      className="relative overflow-hidden rounded-xl px-10 py-4 font-semibold text-white bg-sky-600/80 backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"
      whileHover={{ backgroundColor: "rgba(56,189,248,0.9)" }}
    >
      <span className="relative z-10">{label}</span>

      {/* animated water surface */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[200%] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)] opacity-40"
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.button>
  );
}

export function NebulaButton({ label = "Engage Warp" }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scale: 0.9, filter: "brightness(1.8) blur(2px)" },
      {
        scale: 1,
        filter: "brightness(1) blur(0px)",
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
      }
    );
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 50px rgba(147,51,234,0.7)",
      }}
      whileTap={{ scale: 0.95 }}
      className="relative overflow-hidden rounded-2xl px-12 py-4 text-white font-bold tracking-wide bg-gradient-to-r from-fuchsia-600 via-purple-700 to-indigo-700 backdrop-blur-md"
    >
      {/* moving light gradient */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 120%, rgba(255,255,255,0.3), transparent 60%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* swirl plasma */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(255,0,255,0.15), rgba(0,255,255,0.2), transparent)",
          filter: "blur(20px)",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function InfernoButton({ label = "Overdrive" }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const container = ref.current;
    if (!container) return;

    for (let i = 0; i < 6; i++) {
      const spark = document.createElement("div");
      spark.className =
        "absolute w-2 h-2 bg-orange-400 rounded-full pointer-events-none";
      spark.style.left = `${Math.random() * 100}%`;
      spark.style.top = `${Math.random() * 100}%`;
      container.appendChild(spark);

      gsap.to(spark, {
        x: (Math.random() - 0.5) * 120,
        y: -Math.random() * 100,
        opacity: 0,
        scale: Math.random() * 1.5 + 0.5,
        duration: 0.8 + Math.random() * 0.4,
        ease: "power2.out",
        onComplete: () => spark.remove(),
      });
    }

    gsap.fromTo(
      container,
      { scale: 0.9 },
      { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" }
    );
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 50px rgba(255,80,0,0.6)",
      }}
      whileTap={{ scale: 0.96 }}
      className="relative overflow-hidden rounded-xl px-10 py-4 font-bold text-yellow-50 bg-gradient-to-r from-orange-600 via-red-600 to-amber-500 shadow-[0_0_40px_rgba(255,80,0,0.5)]"
    >
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,200,0,0.4), transparent 70%)",
          filter: "blur(10px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function FrostButton({ label = "Freeze Time" }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const container = ref.current;
    if (!container) return;

    for (let i = 0; i < 10; i++) {
      const flake = document.createElement("div");
      flake.className =
        "absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none";
      flake.style.left = `${50}%`;
      flake.style.top = `${50}%`;
      container.appendChild(flake);

      gsap.to(flake, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: 0,
        scale: Math.random() * 1.5 + 0.5,
        duration: 1 + Math.random() * 0.5,
        ease: "power2.out",
        onComplete: () => flake.remove(),
      });
    }

    gsap.fromTo(
      container,
      { scale: 0.95, filter: "brightness(1.5)" },
      { scale: 1, filter: "brightness(1)", duration: 0.6, ease: "elastic.out(1,0.3)" }
    );
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 60px rgba(200,250,255,0.6)",
      }}
      className="relative overflow-hidden rounded-xl px-10 py-4 font-semibold text-cyan-50 bg-gradient-to-br from-cyan-500/30 to-blue-700/20 border border-cyan-400/40 backdrop-blur-xl"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-40"
        animate={{
          y: [0, -30, 0],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function QuantumButton({ label = "Execute" }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = ref.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ring = document.createElement("div");
    ring.className =
      "absolute border border-cyan-400/50 rounded-full pointer-events-none";
    ring.style.left = `${x - 25}px`;
    ring.style.top = `${y - 25}px`;
    ring.style.width = "50px";
    ring.style.height = "50px";
    container.appendChild(ring);

    gsap.to(ring, {
      scale: 8,
      opacity: 0,
      duration: 1.4,
      ease: "power2.out",
      onComplete: () => ring.remove(),
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,255,255,0.4)" }}
      whileTap={{ scale: 0.95 }}
      className="relative overflow-hidden px-10 py-4 rounded-2xl font-semibold text-cyan-200 bg-white/10 backdrop-blur-xl border border-cyan-400/20"
    >
      <div ref={ref} className="absolute inset-0 overflow-visible" />
      <span className="relative z-10 tracking-wide">{label}</span>
    </motion.button>
  );
}

export function SparkButton() {
  const particlesRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = particlesRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particle = document.createElement("div");
    particle.className = "absolute rounded-full bg-white pointer-events-none";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = "6px";
    particle.style.height = "6px";
    container.appendChild(particle);

    // Animate particle burst
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    });

    // Bounce effect on click
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.9 },
      { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
    );
  };

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255,255,255,0.5)" }}
        whileFocus={{ scale: 1.05 }}
        onClick={handleClick}
        className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold overflow-hidden z-10"
      >
        Spark Button
      </motion.button>
      {/* Particle layer */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none overflow-visible"
      />
    </div>
  );
}

export function MagicButton() {
  const particlesRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = particlesRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particle = document.createElement("div");
    particle.className = "absolute rounded-full bg-purple-400 pointer-events-none";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = "8px";
    particle.style.height = "8px";
    container.appendChild(particle);

    // Animate particle burst
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
      opacity: 0,
      scale: 0,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    });

    // Bounce + subtle rotation
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.95, rotate: -3 },
      { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }
    );
  };

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{
          scale: 1.12,
          rotate: 2,
          boxShadow: "0 0 25px rgba(168,85,247,0.6)",
        }}
        whileFocus={{
          scale: 1.08,
          boxShadow: "0 0 35px rgba(192,132,252,0.9)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        onClick={handleClick}
        className="relative bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-7 py-3 rounded-full font-bold overflow-hidden z-10"
      >
        Magic Button
      </motion.button>
      {/* Particle layer */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none overflow-visible"
      />
    </div>
  );
}

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