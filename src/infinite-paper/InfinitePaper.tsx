import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import type { UseInfinitePaperResult } from "./useInfinitePaper";

export type RenderInfiniteItem<TItem> = (item: TItem, index: number) => ReactNode;

export interface InfinitePaperProps<TItem> {
  paper: UseInfinitePaperResult<TItem>;
  renderItem: RenderInfiniteItem<TItem>;
  className?: string;
  emptyState?: ReactNode;
  loader?: ReactNode;
  header?: ReactNode;
  pageLabel?: (page: number, totalPages?: number) => ReactNode;
  onPageChange?: (page: number) => void;
}

interface PaginationProps {
  page: number;
  totalPages?: number;
  onPrevious: () => void;
  onNext: () => void;
}

function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div
      data-testid="infinite-paper-pagination"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        justifyContent: "space-between",
        padding: "0.5rem 0",
      }}
    >
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous page"
        disabled={page <= 1}
        style={buttonStyle}
      >
        ← Prev
      </button>
      <div style={{ fontWeight: 600, color: "#111" }}>
        Page {page}
        {typeof totalPages === "number" ? ` / ${totalPages}` : ""}
      </div>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next page"
        disabled={typeof totalPages === "number" ? page >= totalPages : false}
        style={buttonStyle}
      >
        Next →
      </button>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid #d1d5db",
  background: "#fff",
  borderRadius: 8,
  padding: "0.35rem 0.75rem",
  cursor: "pointer",
  color: "#111",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  transition: "all 120ms ease",
};

/**
 * Layout wrapper for the Infinite Paper experience: infinite scroll with top pagination.
 */
export function InfinitePaper<TItem>({
  paper,
  renderItem,
  className,
  emptyState = <p style={{ color: "#4b5563" }}>자료가 아직 없습니다.</p>,
  loader = <p style={{ color: "#4b5563" }}>불러오는 중...</p>,
  header,
  pageLabel,
  onPageChange,
}: InfinitePaperProps<TItem>) {
  const { items, isLoading, hasMore, page, totalPages, sentinelRef, goToPage } = paper;

  const pageSummary = useMemo(() => {
    if (pageLabel) return pageLabel(page, totalPages);
    return (
      <span style={{ color: "#111", fontWeight: 600 }}>
        Page {page}
        {typeof totalPages === "number" ? ` / ${totalPages}` : ""}
      </span>
    );
  }, [page, pageLabel, totalPages]);

  const handleNext = async () => {
    await goToPage(page + 1);
  };

  const handlePrevious = async () => {
    const target = Math.max(1, page - 1);
    await goToPage(target);
  };

  useEffect(() => {
    onPageChange?.(page);
  }, [onPageChange, page]);

  return (
    <section
      className={className}
      style={{
        display: "grid",
        gap: "1rem",
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#f9fafb",
      }}
    >
      {header}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Pagination page={page} totalPages={totalPages} onPrevious={handlePrevious} onNext={handleNext} />
        {pageSummary}
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {items.length === 0 && !isLoading ? (
          emptyState
        ) : (
          items.map((item, index) => (
            <article
              key={`paper-item-${index}`}
              style={{
                padding: "1rem",
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              {renderItem(item, index)}
            </article>
          ))
        )}
      </div>

      <div
        data-testid="infinite-paper-sentinel"
        ref={sentinelRef}
        style={{
          minHeight: "1px",
          width: "100%",
        }}
      />

      {isLoading && loader}
      {!hasMore && !isLoading && (
        <p style={{ color: "#4b5563", textAlign: "center" }}>더 이상 불러올 페이지가 없습니다.</p>
      )}
    </section>
  );
}
