import { composeStories } from "@storybook/testing-react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as stories from "./InfinitePaper.stories";

const { Default } = composeStories(stories);

describe("InfinitePaper story", () => {
  it("keeps pagination controls wired inside story", async () => {
    render(<Default />);

    await waitFor(() => expect(screen.getAllByText(/노트 1/).length).toBeGreaterThan(0));

    const nextButton = screen.getByLabelText("Next page");
    await act(async () => {
      nextButton.click();
    });

    await waitFor(() => expect(screen.getAllByText(/노트 8/).length).toBeGreaterThan(0));
    expect(screen.getByTestId("infinite-paper-pagination")).toBeInTheDocument();
  });
});
