import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const settingsSchema = z.object({
  duration: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
    message: "0 이상의 숫자를 입력해주세요.",
  }),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  animationStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

/**
 * Small panel for per-slide tuning.
 */
export function SlideSettingsPanel({ slide, settings, onUpdate, onClose }: SlideSettingsPanelProps) {
  const animationOptions = useMemo(() => Object.entries(animationStyles), []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      duration: String(settings?.duration ?? slide?.baseDuration ?? 2000),
      bgColor: settings?.bgColor ?? "",
      textColor: settings?.textColor ?? "",
      animationStyle: settings?.animationStyle ?? "auto",
    },
  });

  useEffect(() => {
    if (!slide) return;
    form.reset({
      duration: String(settings?.duration ?? slide.baseDuration),
      bgColor: settings?.bgColor ?? "",
      textColor: settings?.textColor ?? "",
      animationStyle: settings?.animationStyle ?? "auto",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id, form]);

  const onSubmit = (data: SettingsFormValues) => {
    onUpdate({
      duration: Number(data.duration),
      bgColor: data.bgColor || undefined,
      textColor: data.textColor || undefined,
      animationStyle: data.animationStyle === "auto" ? undefined : (data.animationStyle as SlideSettings["animationStyle"]),
    });
    onClose();
  };

  if (!slide) return null;

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 text-sm">
          <div className="space-y-2">
            <Label className="text-white/80">Duration (ms)</Label>
            <Controller
              control={form.control}
              name="duration"
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="e.g. 2000"
                  className="bg-white/5 border-white/10 text-white"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              )}
            />
            {form.formState.errors.duration && (
              <p className="text-xs text-red-400">{form.formState.errors.duration.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-white/80">Background</Label>
              <Input
                {...form.register("bgColor")}
                type="text"
                placeholder="#0f172a"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Text color</Label>
              <Input
                {...form.register("textColor")}
                type="text"
                placeholder="#fff"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Animation style</Label>
            <Select
              value={form.watch("animationStyle")}
              onValueChange={(val) => form.setValue("animationStyle", val)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Auto from punctuation" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white">
                <SelectItem value="auto">Auto</SelectItem>
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" className="text-white/70" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="bg-white text-black hover:bg-white/90">
              적용
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
