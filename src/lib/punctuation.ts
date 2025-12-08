import type { PunctuationKind } from "@/types/slides";

const ELLIPSIS = /…|\.\.\.$/;

/** Detect punctuation based on the last character. */
export const getPunctuationKind = (text: string): PunctuationKind => {
  const trimmed = text.trim();
  if (!trimmed) return "none";

  if (ELLIPSIS.test(trimmed)) return "ellipsis";
  const last = trimmed.slice(-1);
  if (last === "!") return "exclamation";
  if (last === "?") return "question";
  if (last === ",") return "comma";
  if (last === ".") return "period";
  return "none";
};

/**
 * Calculate duration based on text length and punctuation.
 */
export const calculateDuration = (text: string, kind: PunctuationKind): number => {
  const base = 500;
  const perChar = 60;
  const lengthDuration = text.length * perChar;

  let punctuationBonus = 0;
  switch (kind) {
    case "exclamation":
      punctuationBonus = 600;
      break;
    case "question":
      punctuationBonus = 600;
      break;
    case "comma":
      punctuationBonus = 200;
      break;
    case "ellipsis":
      punctuationBonus = 1000;
      break;
    case "period":
      punctuationBonus = 400;
      break;
    default:
      punctuationBonus = 0;
  }

  return Math.max(1000, base + lengthDuration + punctuationBonus);
};
