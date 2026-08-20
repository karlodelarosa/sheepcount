export type DiscipleshipAccent =
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "indigo";

export const DISCIPLESHIP_ACCENTS: DiscipleshipAccent[] = [
  "blue",
  "green",
  "purple",
  "pink",
  "indigo",
];

export const discipleshipThemes: Record<
  DiscipleshipAccent,
  {
    gradient: string;
    glow: string;
    badge: string;
    orb: string;
  }
> = {
  blue: {
    gradient:
      "from-blue-600/90 via-sky-600/80 to-cyan-700/90 dark:from-sky-700/80 dark:via-blue-800/70 dark:to-cyan-900/80",
    glow: "shadow-blue-500/25 dark:shadow-blue-900/40",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    orb: "bg-blue-400/30",
  },
  green: {
    gradient:
      "from-emerald-600/90 via-green-600/80 to-teal-700/90 dark:from-emerald-700/80 dark:via-green-800/70 dark:to-teal-900/80",
    glow: "shadow-emerald-500/25 dark:shadow-emerald-900/40",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    orb: "bg-emerald-400/30",
  },
  purple: {
    gradient:
      "from-violet-600/90 via-purple-600/80 to-fuchsia-700/90 dark:from-violet-700/80 dark:via-purple-800/70 dark:to-fuchsia-900/80",
    glow: "shadow-violet-500/25 dark:shadow-violet-900/40",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    orb: "bg-violet-400/30",
  },
  pink: {
    gradient:
      "from-pink-600/90 via-rose-600/80 to-red-700/90 dark:from-pink-700/80 dark:via-rose-800/70 dark:to-red-900/80",
    glow: "shadow-pink-500/25 dark:shadow-pink-900/40",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    orb: "bg-pink-400/30",
  },
  indigo: {
    gradient:
      "from-indigo-600/90 via-blue-600/80 to-violet-700/90 dark:from-indigo-700/80 dark:via-blue-800/70 dark:to-violet-900/80",
    glow: "shadow-indigo-500/25 dark:shadow-indigo-900/40",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    orb: "bg-indigo-400/30",
  },
};

export const discipleshipStatAccentThemes: Record<
  DiscipleshipAccent,
  {
    card: string;
    icon: string;
    value: string;
    glow: string;
    orb: string;
  }
> = {
  blue: {
    card: "border-blue-200/50 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/40 dark:from-blue-950/50 dark:via-card dark:to-sky-950/20 dark:border-blue-800/40",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
    value: "text-blue-950 dark:text-blue-50",
    glow: "group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/30",
    orb: "bg-blue-400/20",
  },
  green: {
    card: "border-emerald-200/50 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 dark:from-emerald-950/50 dark:via-card dark:to-teal-950/20 dark:border-emerald-800/40",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
    value: "text-emerald-950 dark:text-emerald-50",
    glow: "group-hover:shadow-emerald-200/60 dark:group-hover:shadow-emerald-900/30",
    orb: "bg-emerald-400/20",
  },
  purple: {
    card: "border-violet-200/50 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/40 dark:from-violet-950/50 dark:via-card dark:to-fuchsia-950/20 dark:border-violet-800/40",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300",
    value: "text-violet-950 dark:text-violet-50",
    glow: "group-hover:shadow-violet-200/60 dark:group-hover:shadow-violet-900/30",
    orb: "bg-violet-400/20",
  },
  pink: {
    card: "border-pink-200/50 bg-gradient-to-br from-pink-50/90 via-white to-rose-50/40 dark:from-pink-950/50 dark:via-card dark:to-rose-950/20 dark:border-pink-800/40",
    icon: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300",
    value: "text-pink-950 dark:text-pink-50",
    glow: "group-hover:shadow-pink-200/60 dark:group-hover:shadow-pink-900/30",
    orb: "bg-pink-400/20",
  },
  indigo: {
    card: "border-indigo-200/50 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/40 dark:from-indigo-950/50 dark:via-card dark:to-blue-950/20 dark:border-indigo-800/40",
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300",
    value: "text-indigo-950 dark:text-indigo-50",
    glow: "group-hover:shadow-indigo-200/60 dark:group-hover:shadow-indigo-900/30",
    orb: "bg-indigo-400/20",
  },
};

export function accentForIndex(index: number): DiscipleshipAccent {
  return DISCIPLESHIP_ACCENTS[index % DISCIPLESHIP_ACCENTS.length];
}

/**
 * Flat (non-gradient) accent tokens for surfaces that don't use the hero
 * gradient treatment above — e.g. mobile list rows, tab indicators, and
 * icon badges. Keyed by the same DiscipleshipAccent so a group's color
 * identity stays consistent between desktop and mobile.
 */
export const discipleshipFlatAccentThemes: Record<
  DiscipleshipAccent,
  {
    solid: string;
    soft: string;
    text: string;
    border: string;
    tabActive: string;
  }
> = {
  blue: {
    solid:
      "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-500 dark:hover:bg-blue-500/90",
    soft: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200/70 dark:border-blue-800/50",
    tabActive:
      "data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500",
  },
  green: {
    solid:
      "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90",
    soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/70 dark:border-emerald-800/50",
    tabActive:
      "data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-500",
  },
  purple: {
    solid:
      "bg-violet-600 text-white hover:bg-violet-600/90 dark:bg-violet-500 dark:hover:bg-violet-500/90",
    soft: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200/70 dark:border-violet-800/50",
    tabActive:
      "data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:bg-violet-500",
  },
  pink: {
    solid:
      "bg-rose-600 text-white hover:bg-rose-600/90 dark:bg-rose-500 dark:hover:bg-rose-500/90",
    soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200/70 dark:border-rose-800/50",
    tabActive:
      "data-[state=active]:bg-rose-600 data-[state=active]:text-white dark:data-[state=active]:bg-rose-500",
  },
  indigo: {
    solid:
      "bg-indigo-600 text-white hover:bg-indigo-600/90 dark:bg-indigo-500 dark:hover:bg-indigo-500/90",
    soft: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200/70 dark:border-indigo-800/50",
    tabActive:
      "data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500",
  },
};
