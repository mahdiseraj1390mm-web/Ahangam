import React from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="مسیر راهنما"
      className="flex items-center flex-wrap gap-1.5 text-xs text-content-muted py-2 mb-4"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-brand transition-colors"
        title="صفحه اصلی آهنگام"
      >
        <Home className="w-3.5 h-3.5" />
        <span>صفحه اصلی</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronLeft className="w-3.5 h-3.5 text-content-muted/60 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-brand transition-colors truncate max-w-[180px] sm:max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-content-primary font-medium truncate max-w-[200px] sm:max-w-md">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
