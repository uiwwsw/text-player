import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { resolveAnimationStyle } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Slide, SlideSettings } from "@/types/slides";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface ScriptPlayerProps {
  slides: Slide[];
  slideSettings: Record<string, SlideSettings>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayingChange: (state: boolean) => void;
  onOpenSettings: (id: string) => void;
}

/**
 * Fullscreen-like player that animates slides sequentially.
 */
export function ScriptPlayer({
  slides,
  slideSettings,
  currentIndex,
  onIndexChange,
  isPlaying,
  onPlayingChange,
  onOpenSettings,
}: ScriptPlayerProps) {
  const activeSlide = slides[currentIndex];

  useEffect(() => {
    if (!isPlaying || !activeSlide) return;
    const settings = slideSettings[activeSlide.id];
    const duration = settings?.duration ?? activeSlide.baseDuration;
    const timer = setTimeout(() => {
      if (currentIndex < slides.length - 1) {
        onIndexChange(currentIndex + 1);
      } else {
        onPlayingChange(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [activeSlide, currentIndex, isPlaying, onIndexChange, onPlayingChange, slideSettings, slides.length]);

  const goPrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      onPlayingChange(false);
    }
  };

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      onIndexChange(currentIndex + 1);
      onPlayingChange(false);
    }
  };

  return (
    <div className="relative h-full flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.04),transparent_25%)]" />

      {activeSlide ? (
        <div
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center p-6 text-center",
            "transition-colors duration-500",
          )}
          style={{
            backgroundColor: slideSettings[activeSlide.id]?.bgColor,
            color: slideSettings[activeSlide.id]?.textColor,
          }}
        >
          <div className="max-w-5xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-4">Slide {currentIndex + 1}</p>
            <div
              className={cn(
                "text-3xl sm:text-4xl md:text-6xl font-bold leading-tight whitespace-pre-line drop-shadow-xl",
                resolveAnimationStyle(activeSlide.punctuation, slideSettings[activeSlide.id]?.animationStyle),
              )}
            >
              {activeSlide.text}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white/60 z-10">Write something and press Transform.</p>
      )}

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <Button variant="secondary" className="bg-white/10 text-white" onClick={goPrev} disabled={currentIndex === 0}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onPlayingChange(!isPlaying)}
          className="bg-white text-black hover:bg-white/90"
          disabled={!activeSlide}
        >
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <Pause className="h-4 w-4" /> Pause
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4" /> Play
            </span>
          )}
        </Button>
        <Button
          variant="secondary"
          className="bg-white/10 text-white"
          onClick={goNext}
          disabled={currentIndex >= slides.length - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        {activeSlide && (
          <Button variant="ghost" className="text-white/80" onClick={() => onOpenSettings(activeSlide.id)}>
            Edit slide
          </Button>
        )}
      </div>
    </div>
  );
}
