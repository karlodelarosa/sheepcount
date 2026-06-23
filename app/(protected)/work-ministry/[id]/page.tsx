// app/ministries/[id]/page.tsx
// This is the Server Component wrapper for the dynamic route.

import { MinistryDetailPage } from "./index";

interface MinistryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MinistryPage({ params }: MinistryPageProps) {
  const { id } = await params;
  return <MinistryDetailPage ministryId={id} />;
}
