"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbData {
  label: string;
  href?: string;
}

interface BreadcrumbsProps extends React.ComponentProps<"nav"> {
  data: BreadcrumbData[];
  separator?: React.ReactNode;
}

function Breadcrumbs({
  data,
  separator,
  className,
  ...props
}: BreadcrumbsProps) {
  const Separator = separator ?? <ChevronRight className="size-3.5" />;
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol
        data-slot="breadcrumb-list"
        className={cn("flex flex-wrap items-center gap-1 text-sm break-words")}
      >
        {data.map((item, index) => {
          const isLast = index === data.length - 1;
          return (
            <React.Fragment key={index}>
              <li
                data-slot="breadcrumb-item"
                className="inline-flex items-center gap-1"
              >
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    data-slot="breadcrumb-link"
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    data-slot="breadcrumb-page"
                    aria-current={isLast ? "page" : undefined}
                    className={cn(isLast ? "text-foreground font-normal" : "")}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li
                  data-slot="breadcrumb-separator"
                  role="presentation"
                  aria-hidden="true"
                  className="[&>svg]:size-3"
                >
                  {Separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumbs };
