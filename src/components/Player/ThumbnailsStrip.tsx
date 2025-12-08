import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Slide } from "@/types/slides";

interface ThumbnailsStripProps {
  slides: Slide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onOpenSettings: (id: string) => void;
}

/**
 * Horizontal strip of slide thumbnails similar to PPT.
 */
export function ThumbnailsStrip({ slides, currentIndex, onSelect, onOpenSettings }: ThumbnailsStripProps) {
  return (
    <div className="w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto relative z-40">
      <div className="flex gap-2 sm:gap-3 min-w-full">
        {slides.length === 0 && <p className="text-sm text-white/60">Add text to see slides.</p>}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              className={cn(
                "group relative rounded-lg border px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5",
                "border-white/10 bg-white/5 min-w-[180px] sm:min-w-[200px]",
                isActive && "ring-2 ring-white border-white/30",
              )}
              onClick={() => onSelect(idx)}
              onDoubleClick={() => onOpenSettings(slide.id)}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">{idx + 1}</div>
              <div className="text-sm font-medium line-clamp-2 text-white/90">{slide.text}</div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
                onClick={e => {
                  e.stopPropagation();
                  onOpenSettings(slide.id);
                }}
              >
                ⚙️
              </Button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
