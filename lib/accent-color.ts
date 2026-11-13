export const DEFAULT_ACCENT_COLOR = "#fe901c";
export const LEGACY_DEFAULT_ACCENT_COLOR = "#030213";

function parseHex(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function migrateLegacyAccentColor(accentColor: string): string {
  return accentColor.toLowerCase() === LEGACY_DEFAULT_ACCENT_COLOR.toLowerCase()
    ? DEFAULT_ACCENT_COLOR
    : accentColor;
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map(channel => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function getAccentForeground(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#030213" : "#ffffff";
}

export function darkenAccent(hex: string, amount = 0.18): string {
  const { r, g, b } = parseHex(hex);
  const factor = 1 - amount;
  return toHex(r * factor, g * factor, b * factor);
}

export function applyAccentColorVariables(accentColor: string) {
  const root = document.documentElement;
  const accentForeground = getAccentForeground(accentColor);
  root.style.setProperty("--accent-color", accentColor);
  root.style.setProperty("--accent-color-foreground", accentForeground);
  root.style.setProperty("--accent-color-muted", darkenAccent(accentColor));
  const { r, g, b } = parseHex(accentColor);
  root.style.setProperty(
    "--accent-color-strong",
    darkenAccent(accentColor, 0.22),
  );
  root.style.setProperty("--accent-color-soft", `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty(
    "--accent-color-border",
    `rgba(${r}, ${g}, ${b}, 0.28)`,
  );
  root.style.setProperty("--accent-chart-1", accentColor);
  root.style.setProperty("--accent-chart-2", `rgba(${r}, ${g}, ${b}, 0.78)`);
  root.style.setProperty("--accent-chart-3", `rgba(${r}, ${g}, ${b}, 0.56)`);
  root.style.setProperty("--accent-chart-4", `rgba(${r}, ${g}, ${b}, 0.36)`);
  root.style.setProperty("--accent-chart-5", `rgba(${r}, ${g}, ${b}, 0.2)`);
  root.style.setProperty("--sidebar-primary", accentColor);
  root.style.setProperty("--sidebar-primary-foreground", accentForeground);
  root.style.setProperty("--sidebar-ring", accentColor);
}
