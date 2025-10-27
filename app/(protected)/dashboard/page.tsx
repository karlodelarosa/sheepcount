"use client";
import { useTenant } from "@/app/providers/tenant-provider";

export default function DashboardPage() {
  const { user, tenant } = useTenant();

  return (
    <div>
      <h1>Welcome 👋 {user?.email}</h1>
      <pre>
        Tenant: <p>{JSON.stringify(tenant, null, 2)}</p>
      </pre>
    </div>
  );
}
