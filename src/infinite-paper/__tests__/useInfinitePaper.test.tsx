import { act, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfinitePaper } from "../InfinitePaper";
import { useInfinitePaper } from "../useInfinitePaper";

interface MockItem {
  id: string;
  label: string;
}

const createLoader = (totalPages = 3, pageSize = 2) =>
  vi.fn(async (page: number) => {
    const start = (page - 1) * pageSize;
    const items: MockItem[] = Array.from({ length: pageSize }, (_, idx) => ({
      id: `${page}-${idx}`,
      label: `아이템 ${start + idx + 1}`,
    }));

    return { items, totalPages, hasMore: page < totalPages };
  });

function Wrapper({ loadPage }: { loadPage: (page: number, pageSize: number) => Promise<any> }) {
  const paper = useInfinitePaper<MockItem>({ loadPage, pageSize: 2 });

  return (
    <InfinitePaper
      paper={paper}
      renderItem={(item) => <div>{item.label}</div>}
      loader={<div data-testid="loading">loading</div>}
    />
  );
}

describe("useInfinitePaper", () => {
  it("loads initial page and appends items on intersection", async () => {
    const loadPage = createLoader();
    render(<Wrapper loadPage={loadPage} />);

    await waitFor(() => expect(screen.getByText("아이템 1")).toBeInTheDocument());
    expect(screen.getByText("아이템 2")).toBeInTheDocument();

    const sentinel = screen.getByTestId("infinite-paper-sentinel");
    act(() => {
      globalThis.triggerIntersection(sentinel);
    });

    await waitFor(() => expect(screen.getByText("아이템 4")).toBeInTheDocument());
    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it("navigates via pagination controls", async () => {
    const loadPage = createLoader();
    render(<Wrapper loadPage={loadPage} />);

    await waitFor(() => expect(screen.getByText("아이템 2")).toBeInTheDocument());

    const nextButton = screen.getByLabelText("Next page");
    await act(async () => {
      nextButton.click();
    });

    await waitFor(() => expect(screen.getByText("아이템 4")).toBeInTheDocument());
    const pagination = screen.getByTestId("infinite-paper-pagination");
    expect(within(pagination).getByText("Page 2 / 3")).toBeInTheDocument();
  });
});
