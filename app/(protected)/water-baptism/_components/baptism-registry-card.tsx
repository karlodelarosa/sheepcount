import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Droplets,
  FileText,
  MapPin,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBaptismDate, type BaptismRegistryRow } from "../_lib/filters";

export function BaptismRegistryActions({
  row,
  onCertificate,
}: {
  row: BaptismRegistryRow;
  onCertificate: (row: BaptismRegistryRow) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-xl border-[var(--accent-color-border)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
        onClick={() => onCertificate(row)}
      >
        <FileText className="size-4" />
        Certificate
      </Button>
      <Button variant="outline" size="sm" asChild className="rounded-xl">
        <Link href={`/people/${row.person.id}`}>View profile</Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="ml-auto size-9 shrink-0 rounded-full"
      >
        <Link
          href={`/people/${row.person.id}`}
          aria-label={`View ${row.person.name}`}
        >
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export function BaptismRegistryCard({
  row,
  officiant,
  onCertificate,
}: {
  row: BaptismRegistryRow;
  officiant: string | null;
  onCertificate: (row: BaptismRegistryRow) => void;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
          <Droplets className="size-7" />
        </span>
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold tracking-tight">
            <Link
              href={`/people/${row.person.id}`}
              className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2"
            >
              {row.person.name}
            </Link>
          </h2>
          <Badge variant="secondary" className="mt-1 rounded-full">
            {row.recordCount > 1 ? `${row.recordCount} baptisms` : "Baptized"}
          </Badge>
        </div>
      </div>
      <div className="my-4 space-y-3 border-t pt-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Calendar className="size-4 shrink-0" />
          <span>
            Latest baptism: {formatBaptismDate(row.latestRecord.baptizedAt)}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="size-4 shrink-0" />
          <span className="min-w-0 break-words">
            {row.latestRecord.location.trim() || "Location not recorded"}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <UserRound className="size-4 shrink-0" />
          <span className="min-w-0 break-words">
            Officiant: {officiant || "Not recorded"}
          </span>
        </p>
      </div>
      {row.latestRecord.notes && (
        <p className="mb-4 line-clamp-2 break-words text-sm text-muted-foreground">
          {row.latestRecord.notes}
        </p>
      )}
      <div className="mt-auto pt-3">
        <BaptismRegistryActions row={row} onCertificate={onCertificate} />
      </div>
    </article>
  );
}
