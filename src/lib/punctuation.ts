import type { PunctuationKind } from "@/types/slides";

const ELLIPSIS = /(…|⋯|\.{3,})$/;
const TRAILING_WRAPPERS = new Set([
  "\"",
  "'",
  "”",
  "’",
  ")",
  "]",
  "}",
  "）",
  "】",
  "」",
]);

function stripTrailingWrappers(text: string): string {
  let current = text;
  while (current.length > 0) {
    const last = current.slice(-1);
    if (!TRAILING_WRAPPERS.has(last)) break;
    current = current.slice(0, -1).trimEnd();
  }
  return current;
}

/** Detect punctuation based on the last meaningful character. */
export const getPunctuationKind = (text: string): PunctuationKind => {
  const trimmed = text.trim();
  if (!trimmed) return "none";

  const normalized = stripTrailingWrappers(trimmed);
  if (!normalized) return "none";

  if (ELLIPSIS.test(normalized)) return "ellipsis";

  const last = normalized.slice(-1);
  if (last === "!" || last === "！") return "exclamation";
  if (last === "?" || last === "？") return "question";
  if (last === "," || last === "，") return "comma";
  if (last === "." || last === "。") return "period";
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
