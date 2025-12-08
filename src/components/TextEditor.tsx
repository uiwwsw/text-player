import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTransform: () => void;
  isCollapsed: boolean;
}

/**
 * Collapsible editor for writing the raw script text.
 */
export function TextEditor({ value, onChange, onTransform, isCollapsed }: TextEditorProps) {
  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out border-t border-white/10",
        isCollapsed ? "max-h-64" : "max-h-[85vh]",
      )}
    >
      <div className="p-4 sm:p-6 space-y-4 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Editor</p>
            <h2 className="text-lg font-semibold">Write your script</h2>
          </div>
          <Button
            onClick={onTransform}
            className="gap-2 bg-white text-black hover:bg-white/90 w-full sm:w-auto justify-center"
          >
            <Sparkles className="h-4 w-4" /> Transform / Play
          </Button>
        </div>

        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <Label htmlFor="script" className="text-white/70 shrink-0">
            Each non-empty line becomes a slide. You can mix Korean and English.
          </Label>
          <Textarea
            id="script"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 text-base bg-white/5 border-white/10 text-white resize-none min-h-[200px]"
            placeholder="Paste your words here..."
          />
        </div>
      </div>
    </div>
  );
}
