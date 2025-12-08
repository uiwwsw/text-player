export type PunctuationKind = "exclamation" | "question" | "period" | "comma" | "ellipsis" | "none";

export type AnimationStyle = "fade" | "punch" | "shake" | "commaSlide" | "slowFade" | "period" | "zoomIn" | "slideLeft" | "slideRight" | "flip" | "bounce" | "rotate";

export interface Slide {
  id: string;
  text: string;
  punctuation: PunctuationKind;
  baseDuration: number;
}

export interface SlideSettings {
  duration?: number;
  bgColor?: string;
  textColor?: string;
  animationStyle?: AnimationStyle;
}
