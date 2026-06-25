import { FinancialAuditProvider } from "./financial-context";

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinancialAuditProvider>{children}</FinancialAuditProvider>;
}
