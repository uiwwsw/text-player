import type { AnimationStyle, PunctuationKind } from "@/types/slides";

export const animationStyles: Record<AnimationStyle, { label: string; className: string; description: string; durationMs: number }> = {
  fade: { label: "Fade + Rise", className: "animate-fade-rise", description: "Blurred lift with a soft hover", durationMs: 1100 },
  punch: { label: "Punch", className: "animate-punch", description: "Impactful scale pop with rebound", durationMs: 900 },
  shake: { label: "Shake", className: "animate-question", description: "Curious wobble with light tilt", durationMs: 1000 },
  commaSlide: { label: "Comma Slide", className: "animate-comma", description: "Diagonal glide that settles", durationMs: 900 },
  slowFade: { label: "Slow Fade", className: "animate-slow-fade", description: "Suspended dissolve for ellipsis", durationMs: 2000 },
  period: { label: "Period", className: "animate-period", description: "Curtain-lift reveal for statements", durationMs: 1100 },
  zoomIn: { label: "Zoom In", className: "animate-zoom-in", description: "Dramatic scale up from center", durationMs: 800 },
  slideLeft: { label: "Slide Left", className: "animate-slide-left", description: "Smooth entry from right", durationMs: 800 },
  slideRight: { label: "Slide Right", className: "animate-slide-right", description: "Smooth entry from left", durationMs: 800 },
  flip: { label: "Flip", className: "animate-flip", description: "3D flip reveal", durationMs: 900 },
  bounce: { label: "Bounce", className: "animate-bounce-in", description: "Playful bounce entry", durationMs: 900 },
  rotate: { label: "Rotate", className: "animate-rotate-in", description: "Spinning entry", durationMs: 900 },
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
