import { nanoid } from "nanoid";
import type { Slide } from "@/types/slides";
import { getDurationByPunctuation, getPunctuationKind } from "@/lib/punctuation";

const BASE_DURATION = 2000;

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
        baseDuration: getDurationByPunctuation(BASE_DURATION, punctuation),
      } satisfies Slide;
    });
};
