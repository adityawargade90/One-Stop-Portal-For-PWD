import {
  Volume2,
  Moon,
  Sun,
  Type,
  Accessibility,
  Eye,
  BookOpen,
  Zap,
  RotateCcw,
  Keyboard,
  MousePointer2,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

/** Font size steps as percentage of base (100 = default) */
const FONT_SIZE_STEPS = [100, 112, 125, 140] as const;

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [isReadingGuide, setIsReadingGuide] = useState(false);
  const [isReduceMotion, setIsReduceMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<"none" | "protanopia" | "deuteranopia" | "tritanopia">("none");
  const [isFocusEnhanced, setIsFocusEnhanced] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const readingGuideRef = useRef<HTMLDivElement>(null);

  /* ── Close on Escape key ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Reading guide: follow mouse ── */
  useEffect(() => {
    if (!isReadingGuide) return;
    const onMouseMove = (e: MouseEvent) => {
      if (readingGuideRef.current) {
        readingGuideRef.current.style.top = `${e.clientY - 18}px`;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [isReadingGuide]);

  /* ── Feature toggles ── */
  const toggleDarkMode = () => setIsDarkMode(v => { document.documentElement.classList.toggle("dark", !v); return !v; });
  const toggleTextToSpeech = () => setIsTextToSpeech(v => {
    if (!v && "speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Text to speech enabled"));
    else if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    return !v;
  });
  const toggleDyslexiaFont = () => setIsDyslexiaFont(v => { document.documentElement.classList.toggle("dyslexia-font", !v); return !v; });
  const toggleReadingGuide = () => setIsReadingGuide(v => !v);
  const toggleReduceMotion = () => setIsReduceMotion(v => { document.documentElement.classList.toggle("reduce-motion", !v); return !v; });
  const cycleColorBlind = () => {
    const modes = ["none", "protanopia", "deuteranopia", "tritanopia"] as const;
    setColorBlindMode(prev => {
      const next = modes[(modes.indexOf(prev) + 1) % modes.length];
      document.documentElement.classList.remove("colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia");
      if (next !== "none") document.documentElement.classList.add(`colorblind-${next}`);
      return next;
    });
  };
  const toggleFocusEnhanced = () => setIsFocusEnhanced(v => { document.documentElement.classList.toggle("focus-enhanced", !v); return !v; });
  const increaseFontSize = () => setFontSize(prev => { const next = Math.min(prev + 1, 3); document.documentElement.style.fontSize = `${FONT_SIZE_STEPS[next]}%`; return next; });
  const resetFontSize = () => { setFontSize(0); document.documentElement.style.fontSize = ""; };

  const resetAll = () => {
    setIsDarkMode(false); document.documentElement.classList.remove("dark");
    setIsTextToSpeech(false); window.speechSynthesis?.cancel();
    setIsDyslexiaFont(false); document.documentElement.classList.remove("dyslexia-font");
    setIsReadingGuide(false);
    setIsReduceMotion(false); document.documentElement.classList.remove("reduce-motion");
    setColorBlindMode("none"); document.documentElement.classList.remove("colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia");
    setIsFocusEnhanced(false); document.documentElement.classList.remove("focus-enhanced");
    resetFontSize();
  };

  const colorBlindLabel = colorBlindMode === "none" ? "Off" : colorBlindMode.charAt(0).toUpperCase() + colorBlindMode.slice(1);
  const activeCount = [isDarkMode, isTextToSpeech, isDyslexiaFont, isReadingGuide, isReduceMotion, colorBlindMode !== "none", isFocusEnhanced, fontSize > 0].filter(Boolean).length;

  return (
    <>
      {/* SVG colour-blind filters (hidden) */}
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0" />
          </filter>
        </defs>
      </svg>

      {/* Reading guide line */}
      {isReadingGuide && (
        <div ref={readingGuideRef} className="reading-guide-line" aria-hidden="true" />
      )}

      {/* ── Top-right trigger button ── */}
      <div className="fixed top-[4.5rem] right-4 z-[60]">
        <button
          onClick={() => setIsOpen(v => !v)}
          aria-label="Open Accessibility Options"
          aria-expanded={isOpen}
          aria-controls="a11y-panel"
          className="a11y-trigger-btn"
          title="Accessibility Options"
        >
          <span className="a11y-trigger-icon">
            <Accessibility className="w-5 h-5" />
          </span>
          <span className="a11y-trigger-label">
            Accessibility
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </span>
          {activeCount > 0 && (
            <span className="a11y-badge" aria-label={`${activeCount} active`}>{activeCount}</span>
          )}
        </button>
      </div>

      {/* ── Slide-down panel ── */}
      <div
        id="a11y-panel"
        role="dialog"
        aria-label="Accessibility Options Panel"
        className={`fixed top-[7.75rem] right-4 z-[60] a11y-panel ${isOpen ? "a11y-panel--open" : ""}`}
        style={{ width: 340 }}
      >
        {/* Panel header */}
        <div className="a11y-panel-header">
          <div className="flex items-center gap-2">
            <div className="a11y-panel-icon-wrap">
              <Accessibility className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">Accessibility Tools</div>
              <div className="text-[10px] text-white/70">WCAG 2.1 AA</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetAll}
              className="a11y-reset-btn"
              title="Reset all settings"
              aria-label="Reset all accessibility settings"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="a11y-close-btn"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="a11y-panel-body">
          {/* Toggle rows */}
          <div className="space-y-1">
            <ToolRow icon={<Volume2 className="w-4 h-4" />} iconBg="hsl(213 100% 92%)" iconColor="hsl(213 100% 40%)"
              label="Text to Speech" description="Reads page content aloud"
              active={isTextToSpeech} onToggle={toggleTextToSpeech} />

            <ToolRow icon={isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              iconBg="hsl(220 20% 92%)" iconColor="hsl(220 60% 35%)"
              label="Dark Mode" description="Reduces eye strain in low light"
              active={isDarkMode} onToggle={toggleDarkMode} />

            <ToolRow icon={<BookOpen className="w-4 h-4" />} iconBg="hsl(142 76% 90%)" iconColor="hsl(142 76% 30%)"
              label="Dyslexia Font" description="Easier-to-read font"
              active={isDyslexiaFont} onToggle={toggleDyslexiaFont} />

            <ToolRow icon={<MousePointer2 className="w-4 h-4" />} iconBg="hsl(43 96% 90%)" iconColor="hsl(43 96% 35%)"
              label="Reading Guide" description="Yellow highlight follows cursor"
              active={isReadingGuide} onToggle={toggleReadingGuide} />

            <ToolRow icon={<Zap className="w-4 h-4" />} iconBg="hsl(270 70% 92%)" iconColor="hsl(270 70% 45%)"
              label="Reduce Motion" description="Disables animations"
              active={isReduceMotion} onToggle={toggleReduceMotion} />

            <ToolRow icon={<Keyboard className="w-4 h-4" />} iconBg="hsl(0 84% 92%)" iconColor="hsl(0 84% 45%)"
              label="Enhanced Focus" description="Stronger keyboard outline"
              active={isFocusEnhanced} onToggle={toggleFocusEnhanced} />
          </div>

          {/* Color-blind cycle */}
          <div className="a11y-section-divider" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="a11y-icon-wrap" style={{ background: "hsl(174 72% 90%)", color: "hsl(174 72% 28%)" }}>
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-medium text-foreground">Color-blind Mode</div>
                <div className="text-[10px] text-muted-foreground">Tap to cycle modes</div>
              </div>
            </div>
            <button
              onClick={cycleColorBlind}
              aria-pressed={colorBlindMode !== "none"}
              className={`a11y-cycle-btn ${colorBlindMode !== "none" ? "a11y-cycle-btn--active" : ""}`}
            >
              {colorBlindLabel}
            </button>
          </div>

          {/* Font size stepper */}
          <div className="a11y-section-divider" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="a11y-icon-wrap" style={{ background: "hsl(25 95% 92%)", color: "hsl(25 95% 35%)" }}>
                <Type className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-medium text-foreground">Font Size</div>
                <div className="text-[10px] text-muted-foreground">Step {fontSize} / 3</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={increaseFontSize} disabled={fontSize >= 3} className="a11y-stepper-btn" aria-label="Increase font size">A+</button>
              <button onClick={resetFontSize} disabled={fontSize === 0} className="a11y-stepper-btn" aria-label="Reset font size">A↺</button>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="a11y-section-divider" />
          <div className="a11y-shortcuts" role="note" aria-label="Keyboard shortcuts">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> Keyboard Navigation
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              <div><dt className="inline"><kbd className="a11y-kbd">Tab</kbd></dt><dd className="inline"> Next element</dd></div>
              <div><dt className="inline"><kbd className="a11y-kbd">Shift+Tab</kbd></dt><dd className="inline"> Previous</dd></div>
              <div><dt className="inline"><kbd className="a11y-kbd">Enter</kbd></dt><dd className="inline"> Activate</dd></div>
              <div><dt className="inline"><kbd className="a11y-kbd">Esc</kbd></dt><dd className="inline"> Close dialogs</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Toggle row sub-component ── */
function ToolRow({
  icon, iconBg, iconColor,
  label, description,
  active, onToggle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="a11y-icon-wrap" style={{ background: iconBg, color: iconColor }}>{icon}</span>
        <div>
          <div className="text-xs font-medium text-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground">{description}</div>
        </div>
      </div>
      {/* Toggle switch */}
      <button
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={`a11y-toggle ${active ? "a11y-toggle--on" : ""}`}
        aria-label={`${label} ${active ? "on" : "off"}`}
      >
        <span className="a11y-toggle-thumb" />
      </button>
    </div>
  );
}

export default AccessibilityPanel;