export type CampaignAccent = "blue" | "emerald" | "purple" | "orange";

export const categoryAccent: Record<string, CampaignAccent> = {
  Building: "blue",
  Missions: "emerald",
  Youth: "purple",
  Equipment: "orange",
  Other: "blue",
};

export const campaignThemes: Record<
  CampaignAccent,
  {
    gradient: string;
    glow: string;
    ring: string;
    ringTrack: string;
    badge: string;
    bar: string;
    orb: string;
  }
> = {
  blue: {
    gradient:
      "from-blue-600/90 via-indigo-600/80 to-violet-700/90 dark:from-blue-700/80 dark:via-indigo-800/70 dark:to-violet-900/80",
    glow: "shadow-blue-500/25 dark:shadow-blue-900/40",
    ring: "stroke-blue-400 dark:stroke-blue-300",
    ringTrack: "stroke-white/25 dark:stroke-white/15",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    bar: "bg-white/90",
    orb: "bg-blue-400/30",
  },
  emerald: {
    gradient:
      "from-emerald-600/90 via-teal-600/80 to-cyan-700/90 dark:from-emerald-700/80 dark:via-teal-800/70 dark:to-cyan-900/80",
    glow: "shadow-emerald-500/25 dark:shadow-emerald-900/40",
    ring: "stroke-emerald-300 dark:stroke-emerald-200",
    ringTrack: "stroke-white/25 dark:stroke-white/15",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    bar: "bg-white/90",
    orb: "bg-emerald-400/30",
  },
  purple: {
    gradient:
      "from-violet-600/90 via-purple-600/80 to-fuchsia-700/90 dark:from-violet-700/80 dark:via-purple-800/70 dark:to-fuchsia-900/80",
    glow: "shadow-violet-500/25 dark:shadow-violet-900/40",
    ring: "stroke-violet-300 dark:stroke-violet-200",
    ringTrack: "stroke-white/25 dark:stroke-white/15",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    bar: "bg-white/90",
    orb: "bg-violet-400/30",
  },
  orange: {
    gradient:
      "from-amber-500/90 via-orange-600/80 to-rose-600/90 dark:from-amber-600/80 dark:via-orange-700/70 dark:to-rose-800/80",
    glow: "shadow-orange-500/25 dark:shadow-orange-900/40",
    ring: "stroke-amber-300 dark:stroke-amber-200",
    ringTrack: "stroke-white/25 dark:stroke-white/15",
    badge: "bg-white/20 text-white backdrop-blur-sm border-white/25",
    bar: "bg-white/90",
    orb: "bg-orange-400/30",
  },
};

export const statAccentThemes: Record<
  CampaignAccent,
  {
    card: string;
    icon: string;
    value: string;
    glow: string;
    orb: string;
  }
> = {
  purple: {
    card: "border-violet-200/50 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/40 dark:from-violet-950/50 dark:via-card dark:to-fuchsia-950/20 dark:border-violet-800/40",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300",
    value: "text-violet-950 dark:text-violet-50",
    glow: "group-hover:shadow-violet-200/60 dark:group-hover:shadow-violet-900/30",
    orb: "bg-violet-400/20",
  },
  blue: {
    card: "border-blue-200/50 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 dark:from-blue-950/50 dark:via-card dark:to-indigo-950/20 dark:border-blue-800/40",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
    value: "text-blue-950 dark:text-blue-50",
    glow: "group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/30",
    orb: "bg-blue-400/20",
  },
  emerald: {
    card: "border-emerald-200/50 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 dark:from-emerald-950/50 dark:via-card dark:to-teal-950/20 dark:border-emerald-800/40",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
    value: "text-emerald-950 dark:text-emerald-50",
    glow: "group-hover:shadow-emerald-200/60 dark:group-hover:shadow-emerald-900/30",
    orb: "bg-emerald-400/20",
  },
  orange: {
    card: "border-orange-200/50 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/40 dark:from-orange-950/50 dark:via-card dark:to-amber-950/20 dark:border-orange-800/40",
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300",
    value: "text-orange-950 dark:text-orange-50",
    glow: "group-hover:shadow-orange-200/60 dark:group-hover:shadow-orange-900/30",
    orb: "bg-orange-400/20",
  },
};
