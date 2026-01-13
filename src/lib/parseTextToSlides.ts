import { nanoid } from "nanoid";
import type { Slide } from "@/types/slides";
import { calculateDuration, getPunctuationKind } from "@/lib/punctuation";

function indexPreviousSlidesByText(previousSlides: Slide[]) {
  const byText = new Map<string, Slide[]>();
  for (const slide of previousSlides) {
    const key = slide.text;
    const list = byText.get(key);
    if (list) {
      list.push(slide);
    } else {
      byText.set(key, [slide]);
    }
  }
  return byText;
}

/**
 * Convert raw textarea content into slide objects.
 *
 * When `previousSlides` is provided, it tries to reuse slide IDs so that
 * per-slide settings remain stable across repeated "Transform" actions.
 */
export const parseTextToSlides = (raw: string, previousSlides: Slide[] = []): Slide[] => {
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const usedIds = new Set<string>();
  const previousByText = indexPreviousSlidesByText(previousSlides);

  return lines.map((line, idx) => {
    let id: string | undefined;

    const byTextCandidates = previousByText.get(line);
    if (byTextCandidates) {
      while (byTextCandidates.length > 0 && usedIds.has(byTextCandidates[0].id)) {
        byTextCandidates.shift();
      }
      if (byTextCandidates.length > 0) {
        id = byTextCandidates.shift()!.id;
      }
    }

    if (!id) {
      const byIndexCandidate = previousSlides[idx];
      if (byIndexCandidate && !usedIds.has(byIndexCandidate.id)) {
        id = byIndexCandidate.id;
      }
    }

    if (!id) {
      id = `${idx}-${nanoid(6)}`;
    }

    usedIds.add(id);

    const punctuation = getPunctuationKind(line);
    return {
      id,
      text: line,
      punctuation,
      baseDuration: calculateDuration(line, punctuation),
    } satisfies Slide;
  });
};
