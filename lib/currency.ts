export type SupportedCurrency = "PHP" | "USD";

export const DEFAULT_CURRENCY: SupportedCurrency = "PHP";

const SUPPORTED_CURRENCIES = new Set<SupportedCurrency>(["PHP", "USD"]);

export function parseCurrency(raw: unknown): SupportedCurrency {
  if (typeof raw === "string" && SUPPORTED_CURRENCIES.has(raw as SupportedCurrency)) {
    return raw as SupportedCurrency;
  }
  return DEFAULT_CURRENCY;
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(currency === "PHP" ? "en-PH" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencySymbol(
  currency: SupportedCurrency = DEFAULT_CURRENCY,
): string {
  const parts = new Intl.NumberFormat(
    currency === "PHP" ? "en-PH" : "en-US",
    { style: "currency", currency, maximumFractionDigits: 0 },
  ).formatToParts(0);

  return parts.find(part => part.type === "currency")?.value ?? "₱";
}
