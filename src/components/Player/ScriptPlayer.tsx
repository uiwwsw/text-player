import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { animationStyles, resolveAnimationStyle } from "@/lib/animations";
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
  onUpdateSettings: (id: string, values: SlideSettings) => void;
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
  onUpdateSettings,
}: ScriptPlayerProps) {
  const activeSlide = slides[currentIndex];
  const activeSettings = activeSlide ? slideSettings[activeSlide.id] ?? {} : {};
  const resetDurationDelta = activeSlide
    ? activeSlide.baseDuration - (activeSettings.duration ?? activeSlide.baseDuration)
    : 0;

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

  const handleDurationChange = (delta: number) => {
    if (!activeSlide) return;
    const base = activeSettings.duration ?? activeSlide.baseDuration;
    const next = Math.max(400, base + delta);
    onUpdateSettings(activeSlide.id, { duration: next });
  };

  const handleTheme = (bgColor: string, textColor: string) => {
    if (!activeSlide) return;
    onUpdateSettings(activeSlide.id, { bgColor, textColor });
  };

  const handleAnimationChange = (style?: SlideSettings["animationStyle"]) => {
    if (!activeSlide) return;
    onUpdateSettings(activeSlide.id, { animationStyle: style });
  };

  return (
    <div className="relative h-full flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.04),transparent_25%)]" />

      {activeSlide ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                "relative z-10 flex h-full w-full items-center justify-center p-6 text-center",
                "transition-colors duration-500",
              )}
              style={{
                backgroundColor: activeSettings.bgColor,
                color: activeSettings.textColor,
              }}
            >
              <div className="relative max-w-5xl w-full">
                <div className="absolute inset-0 rounded-3xl bg-white/5 blur-3xl" aria-hidden />
                <div className="relative rounded-3xl border border-white/10 bg-black/30 px-6 py-8 shadow-2xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-4">Slide {currentIndex + 1}</p>
                  <div
                    className={cn(
                      "text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight whitespace-pre-wrap break-words text-balance",
                      "drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)]",
                      "max-h-[60vh] overflow-y-auto pr-1",
                      resolveAnimationStyle(activeSlide.punctuation, activeSettings.animationStyle),
                    )}
                  >
                    {activeSlide.text}
                  </div>
                </div>
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent align="end" className="w-64">
            <ContextMenuLabel>Slide {currentIndex + 1} 메뉴</ContextMenuLabel>
            <ContextMenuItem inset onSelect={() => onOpenSettings(activeSlide.id)}>
              세부 설정 열기
            </ContextMenuItem>
            <ContextMenuSeparator />

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>애니메이션 스타일</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                <ContextMenuItem inset onSelect={() => handleAnimationChange(undefined)}>
                  자동 (문장부호 기반)
                </ContextMenuItem>
                {Object.entries(animationStyles).map(([key, info]) => (
                  <ContextMenuItem key={key} inset onSelect={() => handleAnimationChange(key as SlideSettings["animationStyle"])}>
                    <div className="flex flex-col">
                      <span>{info.label}</span>
                      <span className="text-xs text-white/60">{info.description}</span>
                    </div>
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>재생 길이</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem inset onSelect={() => handleDurationChange(-300)}>
                  더 빠르게 (-0.3s)
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => handleDurationChange(300)}>
                  더 느리게 (+0.3s)
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => handleDurationChange(resetDurationDelta)}>
                  기본 길이로 리셋
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>테마</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem inset onSelect={() => handleTheme("#0f172a", "#e2e8f0")}>
                  딥블루 & 서리빛
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => handleTheme("#0c0a09", "#f9fafb")}>
                  다크 앰버
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => handleTheme("#111827", "#f5f3ff")}>
                  네온 보라
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
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
