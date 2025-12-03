import type { AnimationStyle, PunctuationKind } from "@/types/slides";

export const animationStyles: Record<AnimationStyle, { label: string; className: string; description: string }> = {
  fade: { label: "Fade + Rise", className: "animate-fade-rise", description: "Blurred lift with a soft hover" },
  punch: { label: "Punch", className: "animate-punch", description: "Impactful scale pop with rebound" },
  shake: { label: "Shake", className: "animate-question", description: "Curious wobble with light tilt" },
  commaSlide: { label: "Comma Slide", className: "animate-comma", description: "Diagonal glide that settles" },
  slowFade: { label: "Slow Fade", className: "animate-slow-fade", description: "Suspended dissolve for ellipsis" },
  period: { label: "Period", className: "animate-period", description: "Curtain-lift reveal for statements" },
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
