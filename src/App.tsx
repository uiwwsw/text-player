import { useCallback, useEffect, useMemo, useState } from "react";
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
import { encryptText, decryptText } from "@/lib/share";
import { nanoid } from "nanoid";

const STARTER_TEXT = `안녕! 여기는 움직이는 텍스트 무대.
질문이 있나요?
감탄사를 날려봐!
차분히, 한 글자씩.
느리게 이어지는 말...
마침표로 마무리.`;

interface AppProps {
  fullscreenOnly?: boolean;
}

export function App({ fullscreenOnly = false }: AppProps) {
  const [rawText, setRawText] = useState<string>(STARTER_TEXT);
  const [slides, setSlides] = useState<Slide[]>(() => parseTextToSlides(STARTER_TEXT));
  const [slideSettings, setSlideSettings] = useState<Record<string, SlideSettings>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<"edit" | "play">("edit");
  const [settingsTarget, setSettingsTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const activeSlide = useMemo(() => slides[currentIndex], [slides, currentIndex]);

  const handleTransform = () => {
    const parsed = parseTextToSlides(rawText);
    setSlides(parsed);
    setCurrentIndex(0);
    setIsPlaying(true);
    setMode("play");
  };

  const handleReset = () => {
    setMode("edit");
    setIsPlaying(false);
    setSettingsTarget(null);
    setCurrentIndex(0);
    setSlides(parseTextToSlides(rawText));

    if (window.location.search || window.location.hash) {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      window.history.replaceState({}, "", url);
    }
  };

  const showToast = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (fullscreenOnly) {
      setMode("play");
      setIsPlaying(true);
    }
  }, [fullscreenOnly]);

  useEffect(() => {
    if (!settingsTarget) return;
    setIsPlaying(false);
  }, [settingsTarget]);

  const handleSettingsChange = (id: string, values: SlideSettings) => {
    setSlideSettings(prev => ({ ...prev, [id]: { ...prev[id], ...values } }));
  };

  const handleSettingsApply = (values: SlideSettings) => {
    if (!settingsTarget) return;
    handleSettingsChange(settingsTarget, values);
    showToast("슬라이드 설정을 적용했습니다.");
    setSettingsTarget(null);
  };

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const handleShare = useCallback(async () => {
    if (!rawText.trim()) {
      showToast("공유할 텍스트가 없습니다.", "error");
      return;
    }

    try {
      const suggestedKey = nanoid(8);
      const input = window.prompt("공유용 비밀번호를 입력하세요. 비워두면 자동 생성됩니다.", suggestedKey);
      if (input === null) return;
      const passphrase = (input?.trim() ?? "") || suggestedKey;

      const encrypted = await encryptText(rawText, passphrase);
      const url = new URL(window.location.href);
      url.pathname = "/fullscreen";
      url.searchParams.set("data", encrypted);
      const shareUrl = `${url.toString()}#key=${encodeURIComponent(passphrase)}`;

      await navigator.clipboard.writeText(shareUrl);
      showToast("전체화면 공유 링크를 클립보드에 복사했습니다.");
    } catch (error) {
      console.error(error);
      showToast("링크를 만들지 못했습니다.", "error");
    }
  }, [rawText, showToast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) return;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providedKey = hashParams.get("key");

    const load = async () => {
      const passphrase = providedKey ?? window.prompt("공유된 텍스트가 암호화되어 있습니다. 비밀번호를 입력하세요.") ?? "";
      if (!passphrase) {
        showToast("비밀번호가 필요합니다.", "error");
        return;
      }

      try {
        const text = await decryptText(encoded, passphrase);
        const parsed = parseTextToSlides(text);
        setRawText(text);
        setSlides(parsed);
        setCurrentIndex(0);
        setMode(fullscreenOnly ? "play" : "edit");
        setIsPlaying(fullscreenOnly);
        showToast("공유된 텍스트를 불러왔습니다.");
      } catch (error) {
        console.error(error);
        showToast("공유된 텍스트를 해독할 수 없습니다.", "error");
      }
    };

    void load();
  }, [fullscreenOnly, showToast]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {!fullscreenOnly && (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Typography motion lab</p>
            <h1 className="text-xl font-semibold">Text Player</h1>
          </div>
          <Button variant="ghost" onClick={handleReset} className="gap-2 text-white/80 hover:text-white">
            <RefreshCcw className="h-4 w-4" /> Reset to edit
          </Button>
        </header>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {!fullscreenOnly && (
          <ThumbnailsStrip
            slides={slides}
            currentIndex={currentIndex}
            onSelect={handleSelectSlide}
            onOpenSettings={setSettingsTarget}
          />
        )}

        <div className="flex-1 relative">
          <ScriptPlayer
            slides={slides}
            slideSettings={slideSettings}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            onOpenSettings={setSettingsTarget}
            onUpdateSettings={handleSettingsChange}
            onShare={handleShare}
          />
        </div>
      </div>

      {!fullscreenOnly && (
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
      )}

      {!fullscreenOnly && (
        <SlideSettingsPanel
          slide={activeSlide?.id === settingsTarget ? activeSlide : slides.find(s => s.id === settingsTarget) ?? null}
          settings={settingsTarget ? slideSettings[settingsTarget] : undefined}
          onClose={() => setSettingsTarget(null)}
          onUpdate={handleSettingsApply}
        />
      )}

      {toast && (
        <div
          className={
            "fixed bottom-6 right-6 z-40 rounded-lg border px-4 py-3 shadow-xl backdrop-blur " +
            (toast.tone === "success"
              ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
              : "border-red-300/40 bg-red-500/20 text-red-100")
          }
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
