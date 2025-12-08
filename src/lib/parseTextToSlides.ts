import { nanoid } from "nanoid";
import type { Slide } from "@/types/slides";
import { calculateDuration, getPunctuationKind } from "@/lib/punctuation";

/**
 * Convert raw textarea content into slide objects.
 */
export const parseTextToSlides = (raw: string): Slide[] => {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, idx) => {
      const punctuation = getPunctuationKind(line);
      return {
        id: `${idx}-${nanoid(6)}`,
        text: line,
        punctuation,
        baseDuration: calculateDuration(line, punctuation),
      } satisfies Slide;
    });
};
