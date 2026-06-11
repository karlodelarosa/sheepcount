"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function HeroBanner() {
  const heroRef = useRef(null);
  const lightsRef = useRef([]);

  useEffect(() => {
    const hero = heroRef.current;
    const lights = lightsRef.current;

    // --- IDLE LIGHT MOVEMENT ---
    const idleTl = gsap.timeline({ repeat: -1, yoyo: true, ease: "sine.inOut" });
    idleTl.to(lights, {
      duration: 30,
      xPercent: "+=15",
      yPercent: "+=10",
      rotation: "+=20",
      ease: "sine.inOut",
      stagger: 0.3,
    });

    // --- MOUSE INTERACTIVITY (PARALLAX REACTION) ---
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(lights, {
        x: x * 0.05,
        y: y * 0.05,
        duration: 1.5,
        ease: "sine.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(lights, {
        x: 0,
        y: 0,
        duration: 2,
        ease: "sine.inOut",
      });
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      idleTl.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0a] text-center"
    >
      {/* Background Gradient Layers */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (lightsRef.current[i] = el)}
            className="absolute w-[120%] h-[120%] rounded-full blur-[120px] opacity-60 mix-blend-screen"
            style={{
              background: `radial-gradient(circle at center, ${
                i === 0
                  ? "rgba(255,140,0,0.5)"
                  : i === 1
                  ? "rgba(138,43,226,0.5)"
                  : "rgba(255,255,255,0.2)"
              }, transparent 70%)`,
              top: `${30 * i}%`,
              left: `${40 * i}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Text */}
      <h1
        className="text-[10vw] font-bold tracking-tight relative z-10"
        style={{
          background:
            "linear-gradient(90deg, #ff7e00, #b347ff, #ff7e00)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 20px rgba(255,100,0,0.3))",
        }}
      >
        ELGC
      </h1>
      <p className="mt-4 text-lg text-gray-400 z-10">
        Encounter. Love. Grow. Connect.
      </p>

      {/* Optional overlay to soften visuals */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[40px]" />
    </section>
  );
}
