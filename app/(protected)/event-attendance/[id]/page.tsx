"use client";

import { useParams } from "next/navigation";
import { EventDetailView } from "./index";

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return <EventDetailView eventId={id} />;
}
