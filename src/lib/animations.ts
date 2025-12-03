import type { AnimationStyle, PunctuationKind } from "@/types/slides";

export const animationStyles: Record<AnimationStyle, { label: string; className: string; description: string }> = {
  fade: { label: "Fade + Rise", className: "animate-fade-rise", description: "Soft fade with upward drift" },
  punch: { label: "Punch", className: "animate-punch", description: "Scaled punch-in for emphasis" },
  shake: { label: "Shake", className: "animate-question", description: "Gentle shake for curiosity" },
  commaSlide: { label: "Comma Slide", className: "animate-comma", description: "Quick slide + fade" },
  slowFade: { label: "Slow Fade", className: "animate-slow-fade", description: "Lingering fade for ellipsis" },
  period: { label: "Period", className: "animate-period", description: "Clean entrance for statements" },
};

export const defaultAnimationForPunctuation: Record<PunctuationKind, AnimationStyle> = {
  exclamation: "punch",
  question: "shake",
  period: "period",
  comma: "commaSlide",
  ellipsis: "slowFade",
  none: "fade",
};

export const resolveAnimationStyle = (kind: PunctuationKind, custom?: AnimationStyle): string => {
  const style = custom ?? defaultAnimationForPunctuation[kind];
  return animationStyles[style].className;
};
