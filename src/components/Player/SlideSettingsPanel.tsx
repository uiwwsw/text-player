import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
  duration: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  fontSize: z.enum(["sm", "md", "lg", "xl"]),
  animationStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const PRESET_THEMES = [
  { label: "Default (Dark)", bg: "#000000", text: "#ffffff" },
  { label: "Slate", bg: "#0f172a", text: "#e2e8f0" },
  { label: "Paper", bg: "#f8fafc", text: "#0f172a" },
  { label: "Midnight", bg: "#1e1b4b", text: "#e0e7ff" },
  { label: "Deep Forest", bg: "#022c22", text: "#e2e8f0" },
  { label: "Neon Purple", bg: "#2e1065", text: "#f3e8ff" },
];

const FONT_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium (Default)" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
] as const;

/**
 * Small panel for per-slide tuning.
 */
export function SlideSettingsPanel({ slide, settings, onUpdate, onClose }: SlideSettingsPanelProps) {
  const animationOptions = useMemo(() => Object.entries(animationStyles), []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: "onChange",
    defaultValues: {
      duration: String((settings?.duration ?? slide?.baseDuration ?? 1000) / 1000), // Convert ms to s
      bgColor: settings?.bgColor ?? PRESET_THEMES[0].bg,
      textColor: settings?.textColor ?? PRESET_THEMES[0].text,
      fontSize: settings?.fontSize ?? "md",
      animationStyle: settings?.animationStyle ?? "auto",
    },
  });

  useEffect(() => {
    if (!slide) return;
    const currentDuration = settings?.duration ?? slide.baseDuration;

    // Find matching theme or default to custom if not found, but we only have presets now so default to first
    const currentBg = settings?.bgColor ?? PRESET_THEMES[0].bg;
    const currentText = settings?.textColor ?? PRESET_THEMES[0].text;

    form.reset({
      duration: String(currentDuration / 1000),
      bgColor: currentBg,
      textColor: currentText,
      fontSize: settings?.fontSize ?? "md",
      animationStyle: settings?.animationStyle ?? "auto",
    });
  }, [slide?.id, slide?.baseDuration, settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    onUpdate({
      duration: Number(data.duration) * 1000, // Convert s to ms
      bgColor: data.bgColor,
      textColor: data.textColor,
      fontSize: data.fontSize as SlideSettings["fontSize"],
      animationStyle: data.animationStyle === "auto" ? undefined : (data.animationStyle as SlideSettings["animationStyle"]),
    });
    // Don't close immediately to allow tweaking
  };

  // Watch for changes to auto-submit (live preview)
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.duration && value.bgColor && value.textColor && value.fontSize) {
        onUpdate({
          duration: Number(value.duration) * 1000,
          bgColor: value.bgColor,
          textColor: value.textColor,
          fontSize: value.fontSize as SlideSettings["fontSize"],
          animationStyle: value.animationStyle === "auto" ? undefined : (value.animationStyle as SlideSettings["animationStyle"]),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  if (!slide) return null;

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-4 top-24 w-80 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30 animate-in slide-in-from-right-10 fade-in duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Slide {slide.id.slice(0, 4)}</p>
            <h3 className="font-semibold text-white">Settings</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5 text-sm">
          <div className="space-y-2">
            <Label className="text-white/80">Duration</Label>
            <Controller
              control={form.control}
              name="duration"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    {[0.5, 1, 1.5, 2, 3, 4, 5, 7, 10, 15, 20].map((sec) => (
                      <SelectItem key={sec} value={String(sec)}>
                        {sec} Seconds
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Theme</Label>
            <Select
              value={form.watch("bgColor")}
              onValueChange={(val) => {
                const theme = PRESET_THEMES.find(t => t.bg === val);
                if (theme) {
                  form.setValue("bgColor", theme.bg);
                  form.setValue("textColor", theme.text);
                }
              }}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10 text-white">
                {PRESET_THEMES.map((theme) => (
                  <SelectItem key={theme.bg} value={theme.bg}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span>{theme.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Text Size</Label>
            <Controller
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
              <SelectContent className="bg-neutral-900 border-white/10 text-white max-h-[200px]">
                <SelectItem value="auto">Auto (Default)</SelectItem>
                {animationOptions.map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col py-0.5">
                      <span className="font-medium">{info.label}</span>
                      <span className="text-[10px] text-white/50">{info.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>
    </>
  );
}
