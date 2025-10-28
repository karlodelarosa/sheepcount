// app/ministries/[id]/page.tsx
// This is the Server Component wrapper for the dynamic route.

import { MinistryDetailPage } from "./index"; // 🔑 Import the client component

// Next.js automatically receives params in the server component
interface MinistryPageProps {
  params: {
    id: string; // The ministry ID from the URL
  };
}

export default function MinistryPage({ params }: MinistryPageProps) {
  // Pass the ID down to the client component.
  return <MinistryDetailPage ministryId={params.id} />;
}
