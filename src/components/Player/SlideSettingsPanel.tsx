import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { animationStyles } from "@/lib/animations";
import type { Slide, SlideSettings } from "@/types/slides";
import { X } from "lucide-react";

interface SlideSettingsPanelProps {
  slide: Slide | null;
  settings?: SlideSettings;
  onUpdate: (values: SlideSettings) => void;
  onClose: () => void;
}

/**
 * Small panel for per-slide tuning.
 */
export function SlideSettingsPanel({ slide, settings, onUpdate, onClose }: SlideSettingsPanelProps) {
  const animationOptions = useMemo(() => Object.entries(animationStyles), []);

  if (!slide) return null;

  return (
    <aside className="fixed right-4 top-24 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Slide {slide.id.slice(0, 4)}</p>
          <h3 className="font-semibold text-white">Settings</h3>
        </div>
        <Button variant="ghost" size="icon" className="text-white/70" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4 p-4 text-sm">
        <div className="space-y-2">
          <Label className="text-white/80">Duration (ms)</Label>
          <Input
            type="number"
            min={500}
            value={settings?.duration ?? slide.baseDuration}
            onChange={e => onUpdate({ duration: Number(e.target.value) })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-white/80">Background</Label>
            <Input
              type="text"
              placeholder="#0f172a or tailwind name"
              value={settings?.bgColor ?? ""}
              onChange={e => onUpdate({ bgColor: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Text color</Label>
            <Input
              type="text"
              placeholder="#fff"
              value={settings?.textColor ?? ""}
              onChange={e => onUpdate({ textColor: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Animation style</Label>
          <Select
            value={settings?.animationStyle ?? ""}
            onValueChange={value =>
              onUpdate({ animationStyle: value === "" ? undefined : (value as SlideSettings["animationStyle"]) })
            }
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Auto from punctuation" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-white/10 text-white">
              <SelectItem value="">Auto</SelectItem>
              {animationOptions.map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span>{info.label}</span>
                    <span className="text-xs text-white/60">{info.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}
