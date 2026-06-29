"use client";

import { cn } from "@/lib/utils";

export function CampaignProgressRing({
  value,
  size = 72,
  strokeWidth = 5,
  progressClass,
  trackClass,
  labelClass = "text-white",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  progressClass: string;
  trackClass: string;
  labelClass?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", progressClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-sm font-bold tabular-nums leading-none",
            labelClass,
          )}
        >
          {value.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
