import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const STARTER_TEXT = `이 서비스는 텍스트만 입력해도 프레젠테이션을 만들어 줘요.
원하는 내용을 적고 줄바꿈으로 슬라이드를 나눠 보세요.
재생 버튼으로 흐름을 확인하고,
공유 버튼으로 링크를 나눠보세요.`;

interface AppProps {
  fullscreenOnly?: boolean;
}

export function App({ fullscreenOnly = false }: AppProps) {
  const [rawText, setRawText] = useState<string>(STARTER_TEXT);
  const [slides, setSlides] = useState<Slide[]>(() => parseTextToSlides(STARTER_TEXT));
  const [slideSettings, setSlideSettings] = useState<Record<string, SlideSettings>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [mode, setMode] = useState<"edit" | "play">("play");
  const [settingsTarget, setSettingsTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeSlide = useMemo(() => slides[currentIndex], [slides, currentIndex]);
  const canEdit = !fullscreenOnly && !isSharedView;

  useEffect(() => {
    if (!canEdit) {
      setSettingsTarget(null);
    }
  }, [canEdit]);

  useEffect(() => {
    const sharedState = (location.state as { sharedText?: string } | null) ?? null;
    if (!sharedState?.sharedText) return;

    setRawText(sharedState.sharedText);
    const parsed = parseTextToSlides(sharedState.sharedText);
    setSlides(parsed);
    setCurrentIndex(0);
    setIsPlaying(false);
    setMode("edit");
    setIsSharedView(false);

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const copyToClipboard = useCallback(async (text: string) => {
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Clipboard API failed, falling back to execCommand", error);
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);

      const selection = document.getSelection();
      const originalRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand("copy");

      if (selection) {
        selection.removeAllRanges();
        if (originalRange) selection.addRange(originalRange);
      }

      document.body.removeChild(textarea);
      return successful;
    } catch (error) {
      console.error("Clipboard fallback failed", error);
      return false;
    }
  }, []);

  const handleTransform = () => {
    const parsed = parseTextToSlides(rawText);
    setSlides(parsed);
    setCurrentIndex(0);
    setIsPlaying(true);
    setMode("play");
  };

  const handleReset = () => {
    setIsSharedView(false);
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

  const handleReturnToEditor = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Failed to exit fullscreen", error);
      }
    }

    navigate("/", { state: { sharedText: rawText } });
  }, [navigate, rawText]);

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

      const copied = await copyToClipboard(shareUrl);
      if (!copied) {
        showToast("클립보드에 복사하지 못했습니다.", "error");
        return;
      }

      showToast("전체화면 공유 링크를 클립보드에 복사했습니다.");
    } catch (error) {
      console.error(error);
      showToast("링크를 만들지 못했습니다.", "error");
    }
  }, [copyToClipboard, rawText, showToast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) return;

    setIsSharedView(true);

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
      {!canEdit && (
        <div className="fixed inset-x-0 top-3 z-40 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-black/70 px-3 py-2 sm:px-4 shadow-lg backdrop-blur-xl">
            <p className="text-sm text-center sm:text-left text-white/80">
              풀스크린이나 공유 화면입니다. 메인으로 돌아가면 내용을 다시 수정할 수 있어요.
            </p>
            <Button
              size="sm"
              className="w-full sm:w-auto bg-white text-black hover:bg-white/90"
              onClick={handleReturnToEditor}
            >
              메인으로 이동
            </Button>
          </div>
        </div>
      )}

      {canEdit && (
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
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
        {canEdit && (
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
            isLooping={isLooping}
            onLoopingChange={setIsLooping}
            onOpenSettings={setSettingsTarget}
            onUpdateSettings={handleSettingsChange}
            onShare={handleShare}
            canEdit={canEdit}
          />
        </div>
      </div>

      {canEdit && (
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

      {canEdit && (
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
