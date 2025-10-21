import Sidebar from "./_components/sidebar/sidebar";
import Header from "./_components/header/header";
import { TenantProvider } from "../providers/tenant-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col gap-6 p-6 bg-gray-100">
          <main className="flex-1 flex flex-col gap-6">
            <TenantProvider>
              {children}
            </TenantProvider>
          </main>
        </div>
      </div>
    </main>
  );
}
