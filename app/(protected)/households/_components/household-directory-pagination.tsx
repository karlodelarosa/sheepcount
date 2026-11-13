import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HOUSEHOLD_PAGE_SIZE_OPTIONS,
  type HouseholdPageSize,
} from "../_lib/directory";

type HouseholdDirectoryPaginationProps = {
  page: number;
  pageSize: HouseholdPageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: HouseholdPageSize) => void;
};

export function HouseholdDirectoryPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: HouseholdDirectoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm tabular-nums text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–
        {Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {totalPages > 1 ? (
          <Pagination className="mx-0 w-auto justify-start">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    onPageChange(Math.max(1, page - 1));
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                pageNumber => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={event => {
                        event.preventDefault();
                        onPageChange(pageNumber);
                      }}
                      className={
                        pageNumber === page
                          ? "border-[var(--accent-color-border)] bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                          : ""
                      }
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    onPageChange(Math.min(totalPages, page + 1));
                  }}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={value =>
              onPageSizeChange(Number(value) as HouseholdPageSize)
            }
          >
            <SelectTrigger
              size="sm"
              aria-label="Households per page"
              className="w-20 rounded-lg focus:ring-[var(--accent-color)]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOUSEHOLD_PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
