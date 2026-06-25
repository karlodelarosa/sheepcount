"use client";

import React, { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

gsap.registerPlugin(Physics2DPlugin);

type CellRef = HTMLDivElement | null;

const X_MAX = 11;
const Y_MAX = 11;
const PULL_DISTANCE = 70;

const HeroGridPhysics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<CellRef[]>([]);
  const clicked = useRef(false);
  const resetAll = useRef(false);

  // Build a stable array of indexes to render
  const cellsIndexes = Array.from({ length: X_MAX * Y_MAX }).map((_, i) => i);

  // Update center positions of cells (store on element.dataset)
  const updateCellPositions = useCallback(() => {
    cellRefs.current.forEach((cell) => {
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      (cell as any).center_position = {
        x: (rect.left + rect.right) / 2,
        y: (rect.top + rect.bottom) / 2,
      };
    });
  }, []);

  // Pointer move handler (pull effect)
  const handlePointerMove = useCallback(
    (e?: PointerEvent) => {
      if (clicked.current) return;
      // default when no pointer (e.g., pointerleave): move pointer offscreen
      const pointerX = e?.pageX ?? -PULL_DISTANCE;
      const pointerY = e?.pageY ?? -PULL_DISTANCE;

      cellRefs.current.forEach((cell) => {
        if (!cell) return;
        const pos = (cell as any).center_position;
        if (!pos) return;

        const diffX = pointerX - pos.x;
        const diffY = pointerY - pos.y;
        const distance = Math.hypot(diffX, diffY);

        if (distance < PULL_DISTANCE) {
          const percent = distance / PULL_DISTANCE;
          (cell as any).pulled = true;
          gsap.to(cell, {
            duration: 0.18,
            x: diffX * percent,
            y: diffY * percent,
            overwrite: "auto",
            ease: "sine.out",
          });
        } else if ((cell as any).pulled) {
          (cell as any).pulled = false;
          gsap.to(cell, {
            duration: 0.9,
            x: 0,
            y: 0,
            ease: "elastic.out(1, 0.3)",
            overwrite: "auto",
          });
        }
      });

      if (resetAll.current) {
        resetAll.current = false;
        gsap.to(
          cellRefs.current.filter(Boolean) as HTMLDivElement[],
          {
            duration: 0.9,
            x: 0,
            y: 0,
            ease: "elastic.out(1, 0.3)",
          }
        );
      }
    },
    []
  );

  // Click handler to trigger physics explosion
  const handleCellClick = useCallback(
    (index: number) => {
      if (clicked.current) return;
      clicked.current = true;

      const cells = cellRefs.current.filter(Boolean) as HTMLDivElement[];
      // Play physics explosion with stagger from clicked index
      const tween = gsap.to(cells, {
        duration: 1.6,
        physics2D: {
          velocity: "random(400, 1000)",
          angle: "random(250, 290)",
          gravity: 2000,
        },
        stagger: {
          grid: [X_MAX, Y_MAX],
          from: index,
          amount: 0.3,
        },
        onComplete: function () {
          // reverse playback by inverting timeScale (plays back quickly)
          // note: 'this' is the tween instance
          try {
            this.timeScale(-1.3);
          } catch (err) {
            // ignore if timeScale fails
          }
        },
        onReverseComplete: () => {
          clicked.current = false;
          resetAll.current = true;
          // call pointer handler once to re-evaluate positions and snap back
          handlePointerMove();
        },
      });

      // safety: after some time, ensure clicked resets if something goes wrong
      setTimeout(() => {
        if (clicked.current) {
          // gently reset
          gsap.to(cells, { duration: 0.6, x: 0, y: 0, ease: "sine.inOut" });
          clicked.current = false;
          resetAll.current = true;
        }
      }, 6000);
    },
    [handlePointerMove]
  );

  // Setup event listeners and initial measurements
  useLayoutEffect(() => {
    updateCellPositions();
    window.addEventListener("resize", updateCellPositions);
    window.addEventListener("pointermove", handlePointerMove);
    // when pointer leaves the document, call handler with no event to reset
    document.addEventListener("pointerleave", () => handlePointerMove());

    // attach pointerup (click) to each cell element
    const cells = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    cells.forEach((cell, i) => {
      // store index on element for safety
      (cell as any).__index = i;
      const onUp = () => handleCellClick(i);
      cell.addEventListener("pointerup", onUp);
      // save the listener for cleanup on element
      (cell as any).__onUp = onUp;
    });

    // cleanup
    return () => {
      window.removeEventListener("resize", updateCellPositions);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", () => handlePointerMove());
      // remove per-cell listeners
      cellRefs.current.forEach((cell) => {
        if (!cell) return;
        const onUp = (cell as any).__onUp;
        if (onUp) cell.removeEventListener("pointerup", onUp);
      });
      // kill any tweens on cells
      gsap.killTweensOf(cellRefs.current.filter(Boolean));
    };
  }, [updateCellPositions, handlePointerMove, handleCellClick]);

  // After first render, measure positions (useLayoutEffect ensures DOM painted)
  useLayoutEffect(() => {
    updateCellPositions();
    // small timeout to allow fonts/paint, then measure again
    const t = window.setTimeout(updateCellPositions, 120);
    return () => clearTimeout(t);
  }, [updateCellPositions]);

  return (
    <div className="hero-container" ref={containerRef}>
      <div className="grid" role="grid" aria-label="physics-grid">
        {Array.from({ length: X_MAX }).map((_, rowIdx) => (
          <div className="row" key={rowIdx} role="row">
            {Array.from({ length: Y_MAX }).map((_, colIdx) => {
              const index = rowIdx * Y_MAX + colIdx;
              return (
                <div
                  key={index}
                  ref={el => {
                    cellRefs.current[index] = el;
                  }}
                  className="cell"
                  data-x={rowIdx}
                  data-y={colIdx}
                  role="button"
                  tabIndex={-1}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Styles: plain CSS-in-JS block for easy copy */}
      <style jsx>{`
        .hero-container {
          display: grid;
          justify-content: center;
          align-content: center;
          background-color: #0e100f;
          height: 100svh;
          margin: 0;
          overflow: hidden;
          user-select: none;
        }
        .grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          touch-action: none;
        }
        .row {
          display: flex;
          gap: 12px;
        }
        .cell {
          width: 24px;
          height: 24px;
          background-color: #fffce1;
          border-radius: 50%;
          will-change: transform;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35),
            inset 0 -2px 6px rgba(0, 0, 0, 0.06);
          transition: transform 0.12s ease;
        }
        .cell:hover {
          transform: scale(1.06);
        }
        @media (max-width: 720px) {
          .cell {
            width: 18px;
            height: 18px;
          }
          .grid {
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroGridPhysics;
