import { useMemo, useState } from "react";
import "./index.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlideSettingsPanel } from "@/components/Player/SlideSettingsPanel";
import { ScriptPlayer } from "@/components/Player/ScriptPlayer";
import { TextEditor } from "@/components/TextEditor";
import { ThumbnailsStrip } from "@/components/Player/ThumbnailsStrip";
import { parseTextToSlides } from "@/lib/parseTextToSlides";
import type { Slide, SlideSettings } from "@/types/slides";
import { RefreshCcw } from "lucide-react";

const STARTER_TEXT = `안녕! 여기는 움직이는 텍스트 무대.
질문이 있나요?
감탄사를 날려봐!
차분히, 한 글자씩.
느리게 이어지는 말...
마침표로 마무리.`;

export function App() {
  const [rawText, setRawText] = useState<string>(STARTER_TEXT);
  const [slides, setSlides] = useState<Slide[]>(() => parseTextToSlides(STARTER_TEXT));
  const [slideSettings, setSlideSettings] = useState<Record<string, SlideSettings>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<"edit" | "play">("edit");
  const [settingsTarget, setSettingsTarget] = useState<string | null>(null);

  const activeSlide = useMemo(() => slides[currentIndex], [slides, currentIndex]);

  const handleTransform = () => {
    const parsed = parseTextToSlides(rawText);
    setSlides(parsed);
    setCurrentIndex(0);
    setIsPlaying(true);
    setMode("play");
  };

  const handleSettingsChange = (id: string, values: SlideSettings) => {
    setSlideSettings(prev => ({ ...prev, [id]: { ...prev[id], ...values } }));
  };

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setMode("edit");
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Typography motion lab</p>
          <h1 className="text-xl font-semibold">Text Player</h1>
        </div>
        <Button variant="ghost" onClick={handleReset} className="gap-2 text-white/80 hover:text-white">
          <RefreshCcw className="h-4 w-4" /> Reset to edit
        </Button>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ThumbnailsStrip
          slides={slides}
          currentIndex={currentIndex}
          onSelect={handleSelectSlide}
          onOpenSettings={setSettingsTarget}
        />

        <div className="flex-1 relative">
          <ScriptPlayer
            slides={slides}
            slideSettings={slideSettings}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            onOpenSettings={setSettingsTarget}
          />
        </div>
      </div>

      <Card
        className={`border-white/10 bg-black/60 backdrop-blur-md transition-all duration-500 sticky bottom-0`}
      >
        <CardContent className="p-0">
          <TextEditor
            value={rawText}
            onChange={setRawText}
            onTransform={handleTransform}
            isCollapsed={mode === "play"}
          />
        </CardContent>
      </Card>

      <SlideSettingsPanel
        slide={activeSlide?.id === settingsTarget ? activeSlide : slides.find(s => s.id === settingsTarget) ?? null}
        settings={settingsTarget ? slideSettings[settingsTarget] : undefined}
        onClose={() => setSettingsTarget(null)}
        onUpdate={values => settingsTarget && handleSettingsChange(settingsTarget, values)}
      />
    </div>
  );
}

export default App;
