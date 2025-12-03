import type { PunctuationKind } from "@/types/slides";

const ELLIPSIS = /…|\.\.\.$/;

/** Detect punctuation based on the last character. */
export const getPunctuationKind = (text: string): PunctuationKind => {
  const trimmed = text.trim();
  if (!trimmed) return "none";

  if (ELLIPSIS.test(trimmed)) return "ellipsis";
  const last = trimmed.at(-1);
  if (last === "!") return "exclamation";
  if (last === "?") return "question";
  if (last === ",") return "comma";
  if (last === ".") return "period";
  return "none";
};

/**
 * Returns an adjusted duration based on punctuation emphasis.
 */
export const getDurationByPunctuation = (base: number, kind: PunctuationKind): number => {
  switch (kind) {
    case "exclamation":
      return base + 600;
    case "question":
      return base + 350;
    case "comma":
      return Math.max(700, base - 300);
    case "ellipsis":
      return base + 1200;
    case "period":
      return base;
    default:
      return base + 150;
  }
};
