"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { AuditDetailView } from "../_components/audit-detail-view";

function AuditDetailPageContent() {
  const params = useParams();
  const auditId = params?.auditId as string | undefined;

  if (!auditId) {
    return (
      <div className="p-8 text-center text-red-500">
        Audit ID not found.
      </div>
    );
  }

  return <AuditDetailView auditId={auditId} />;
}

export default function AuditDetailPage() {
  return (
    <Suspense fallback={null}>
      <AuditDetailPageContent />
    </Suspense>
  );
}
