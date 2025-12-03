import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface PageFetchResult<TItem> {
  items: TItem[];
  totalPages?: number;
  hasMore?: boolean;
}

export interface UseInfinitePaperOptions<TItem> {
  loadPage: (page: number, pageSize: number) => Promise<PageFetchResult<TItem>>;
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
  enabled?: boolean;
}

export interface UseInfinitePaperResult<TItem> {
  items: TItem[];
  page: number;
  totalPages?: number;
  hasMore: boolean;
  isLoading: boolean;
  error?: Error | null;
  sentinelRef: RefObject<HTMLDivElement>;
  loadNextPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Shared hook for infinite scroll with opt-in pagination controls.
 */
export function useInfinitePaper<TItem>({
  loadPage,
  initialPage = 1,
  pageSize = 10,
  threshold = 0.6,
  enabled = true,
}: UseInfinitePaperOptions<TItem>): UseInfinitePaperResult<TItem> {
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState<Record<number, TItem[]>>({});
  const pagesRef = useRef<Record<number, TItem[]>>({});
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [hasMoreState, setHasMoreState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inflight = useRef<Set<number>>(new Set());

  const hasMore = typeof totalPages === "number" ? page < totalPages : hasMoreState;

  const persistPage = useCallback((pageNumber: number, items: TItem[]) => {
    setPages(prev => {
      if (prev[pageNumber]) return prev;
      const next = { ...prev, [pageNumber]: items };
      pagesRef.current = next;
      return next;
    });
  }, []);

  const fetchPage = useCallback(
    async (targetPage: number) => {
      if (pagesRef.current[targetPage] || inflight.current.has(targetPage)) return;

      setIsLoading(true);
      setError(null);
      inflight.current.add(targetPage);

      try {
        const result = await loadPage(targetPage, pageSize);
        persistPage(targetPage, result.items);

        if (typeof result.totalPages === "number") {
          setTotalPages(result.totalPages);
        }

        if (typeof result.hasMore === "boolean") {
          setHasMoreState(result.hasMore);
          if (!result.hasMore && !result.totalPages) {
            setTotalPages(targetPage);
          }
        }
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error(String(err));
        setError(nextError);
        throw nextError;
      } finally {
        inflight.current.delete(targetPage);
        setIsLoading(false);
      }
    },
    [loadPage, pageSize, persistPage],
  );

  const loadPagesUpTo = useCallback(
    async (targetPage: number) => {
      for (let current = 1; current <= targetPage; current++) {
        await fetchPage(current);
      }
    },
    [fetchPage],
  );

  const goToPage = useCallback(
    async (targetPage: number) => {
      if (targetPage < 1) return;

      const cappedPage =
        typeof totalPages === "number" ? Math.min(targetPage, totalPages) : targetPage;

      await loadPagesUpTo(cappedPage);
      setPage(cappedPage);
    },
    [loadPagesUpTo, totalPages],
  );

  const loadNextPage = useCallback(async () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    await goToPage(nextPage);
  }, [goToPage, hasMore, page]);

  const reset = useCallback(async () => {
    inflight.current.clear();
    pagesRef.current = {};
    setPages({});
    setTotalPages(undefined);
    setHasMoreState(true);
    setPage(initialPage);
    await goToPage(initialPage);
  }, [goToPage, initialPage]);

  useEffect(() => {
    void goToPage(initialPage);
  }, [goToPage, initialPage]);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        void loadNextPage();
      }
    }, { threshold });

    const node = sentinelRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [enabled, loadNextPage, threshold]);

  const items = useMemo(() => {
    return Object.keys(pagesRef.current)
      .map(Number)
      .filter(pageNumber => pageNumber <= page)
      .sort((a, b) => a - b)
      .flatMap(pageNumber => pagesRef.current[pageNumber] ?? []);
  }, [page, pages]);

  return {
    items,
    page,
    totalPages,
    hasMore,
    isLoading,
    error,
    sentinelRef,
    loadNextPage,
    goToPage,
    reset,
  };
}
