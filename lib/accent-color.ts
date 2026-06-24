function parseHex(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function getAccentForeground(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#030213" : "#ffffff";
}

export function darkenAccent(hex: string, amount = 0.18): string {
  const { r, g, b } = parseHex(hex);
  const factor = 1 - amount;
  return toHex(r * factor, g * factor, b * factor);
}

export function applyAccentColorVariables(accentColor: string) {
  const root = document.documentElement;
  root.style.setProperty("--accent-color", accentColor);
  root.style.setProperty(
    "--accent-color-foreground",
    getAccentForeground(accentColor),
  );
  root.style.setProperty(
    "--accent-color-muted",
    darkenAccent(accentColor),
  );
  root.style.setProperty("--sidebar-primary", accentColor);
  root.style.setProperty("--sidebar-ring", accentColor);
}
