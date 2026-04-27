/**
 * HandGestureController — DivyangConnect
 *
 * Lives OUTSIDE <BrowserRouter> so it NEVER unmounts on navigation.
 *
 * ═══════════════════════════════════════════════════════════
 *  FLOW
 * ═══════════════════════════════════════════════════════════
 *  1. User clicks FAB → Tutorial video modal appears
 *  2. User watches video, clicks "Enable Gesture Control"
 *     → Modal closes, camera + MediaPipe start
 *  3. Clicking FAB again while enabled → disables & stops camera
 *
 * ═══════════════════════════════════════════════════════════
 *  GESTURE RULES
 * ═══════════════════════════════════════════════════════════
 *
 *  🖐 OPEN HAND  (all 4 fingers up)
 *       Move hand UP   → scroll page up
 *       Move hand DOWN → scroll page down
 *
 *  ☝  POINT & DWELL  (only index finger up, hold cursor still ~1 s)
 *       Extend index finger → cursor tracks it
 *       Keep cursor still over any element → ring fills → AUTO CLICK
 *
 *  ✌  VICTORY  (index + middle up)
 *       Hold briefly → toggle virtual keyboard
 *
 *  👋 SWIPE  (move wrist left / right quickly)
 *       Left  → browser Back
 *       Right → browser Forward
 *
 * ═══════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand, X, Keyboard, ChevronUp, ChevronDown,
  Wifi, Info, Play, CheckCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Landmark { x: number; y: number; z: number }

// ── Constants ─────────────────────────────────────────────────────────────
const SCROLL_SENS     = 900;
const SWIPE_THRESH    = 0.28;
const SMOOTH          = 0.10;
const SCROLL_DEADZONE = 3;
const MIN_PALM_SIZE   = 0.01;
const GESTURE_CONFIRM = 3;
const DWELL_RADIUS    = 28;
const DWELL_FRAMES    = 36;
const SWIPE_CD        = 45;

// ── Tutorial video URL ─────────────────────────────────────────────────────
// Replace this with your actual hosted video URL (mp4, webm, etc.)
// Or use a YouTube embed URL for an iframe instead.
const TUTORIAL_VIDEO_URL = "YOUR_VIDEO_URL_HERE";

// ── Gesture guide data ─────────────────────────────────────────────────────
const GESTURE_RULES = [
  {
    emoji: "🖐",
    title: "Scroll Up / Down",
    desc:  "Open ALL 4 fingers wide. Move hand UP to scroll up, DOWN to scroll down.",
    color: "#6366f1",
  },
  {
    emoji: "☝",
    title: "Click (Dwell)",
    desc:  "Extend only your INDEX finger. Move cursor over any button/link. Hold still ~1 second — the ring fills up and clicks automatically.",
    color: "#22c55e",
  },
  {
    emoji: "✌",
    title: "Toggle Keyboard",
    desc:  "Show VICTORY sign (index + middle up). Hold briefly to open/close the virtual keyboard.",
    color: "#f59e0b",
  },
  {
    emoji: "👋",
    title: "Navigate",
    desc:  "Swipe wrist LEFT for browser Back, RIGHT for browser Forward.",
    color: "#ec4899",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const dist2D = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;
const pxDist  = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by);

function analyze(lm: Landmark[]) {
  const th  = lm[4];
  const t8  = lm[8];
  const t12 = lm[12];
  const t16 = lm[16];
  const t20 = lm[20];
  const p6  = lm[6];  const p7  = lm[7];
  const p10 = lm[10]; const p11 = lm[11];
  const p14 = lm[14]; const p15 = lm[15];
  const p18 = lm[18]; const p19 = lm[19];
  const wrist = lm[0];

  const palmSize  = dist2D(wrist, lm[9]);
  const pinchDist = dist2D(th, t8);
  const normPinch = palmSize > MIN_PALM_SIZE ? pinchDist / palmSize : pinchDist;
  const isPinch   = normPinch < 0.22;

  const iUp = t8.y  < p6.y  - 0.02 && t8.y  < p7.y;
  const mUp = t12.y < p10.y - 0.02 && t12.y < p11.y;
  const rUp = t16.y < p14.y - 0.02 && t16.y < p15.y;
  const pUp = t20.y < p18.y - 0.02 && t20.y < p19.y;

  const extCount  = [iUp, mUp, rUp, pUp].filter(Boolean).length;
  const isOpen    = extCount >= 4;
  const isPoint   = iUp && !mUp && !rUp && !pUp;
  const isVictory = iUp && mUp && !rUp && !pUp;

  return { isPinch, isPoint, isVictory, isOpen, extCount, t8, th, wrist };
}

// ── Map fly helper ─────────────────────────────────────────────────────────
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  return null;
}

// ══════════════════════════════════════════════════════════════════════════
//  Tutorial Modal
// ══════════════════════════════════════════════════════════════════════════
interface TutorialModalProps {
  onEnable: () => void;
  onSkip:   () => void;
}

function TutorialModal({ onEnable, onSkip }: TutorialModalProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setVideoPlaying(true);
    videoRef.current?.play().catch(() => {});
  };

  // Determine if using YouTube embed or native video
  const isYouTube = TUTORIAL_VIDEO_URL.includes("youtube.com") || TUTORIAL_VIDEO_URL.includes("youtu.be");
  const isPlaceholder = TUTORIAL_VIDEO_URL === "YOUR_VIDEO_URL_HERE";

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999999,
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) onSkip(); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(24px);opacity:0 } to { transform:translateY(0);opacity:1 } }
      `}</style>

      <div style={{
        background: "#fff",
        borderRadius: 18,
        width: 500,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        animation: "slideUp 0.25s ease",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>🖐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 2 }}>
              Gesture Control Tutorial
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Watch how to control the app with your hand
            </div>
          </div>
          <button
            onClick={onSkip}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              border: "1px solid #e5e7eb", background: "#f9fafb",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#9ca3af", flexShrink: 0,
              fontSize: 14,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Video area ── */}
        <div style={{
          background: "#0a0a14",
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
        }}>
          {isPlaceholder ? (
            // Placeholder when no video URL is set
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(99,102,241,0.15)",
                border: "2px dashed rgba(99,102,241,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Play size={28} color="rgba(99,102,241,0.7)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  Tutorial Video
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                  Set TUTORIAL_VIDEO_URL in the component
                </div>
              </div>
            </div>
          ) : isYouTube ? (
            // YouTube embed
            <iframe
              src={TUTORIAL_VIDEO_URL}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Native video
            <>
              <video
                ref={videoRef}
                src={TUTORIAL_VIDEO_URL}
                controls
                style={{
                  width: "100%", height: "100%",
                  display: videoPlaying ? "block" : "none",
                  objectFit: "cover",
                }}
                onEnded={() => setVideoPlaying(false)}
              />
              {!videoPlaying && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 14,
                }}>
                  <button
                    onClick={handlePlay}
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "rgba(99,102,241,0.9)",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "transform 0.15s, background 0.15s",
                      boxShadow: "0 4px 24px rgba(99,102,241,0.5)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Play size={26} color="#fff" fill="#fff" />
                  </button>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                    Click to watch the tutorial
                  </div>
                </div>
              )}
            </>
          )}

          {/* Duration badge */}
          {!isPlaceholder && (
            <div style={{
              position: "absolute", bottom: 10, right: 10,
              background: "rgba(0,0,0,0.65)", color: "#fff",
              fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
            }}>
              ~30s
            </div>
          )}
        </div>

        {/* ── Gesture chips ── */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Supported Gestures
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {GESTURE_RULES.map(rule => (
              <div key={rule.title} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 11px", borderRadius: 20,
                border: `1px solid ${rule.color}30`,
                background: `${rule.color}0d`,
                fontSize: 12, color: "#374151",
              }}>
                <span style={{ fontSize: 15 }}>{rule.emoji}</span>
                <span style={{ color: rule.color, fontWeight: 600 }}>{rule.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tips row ── */}
        <div style={{
          margin: "0 20px 14px",
          padding: "10px 14px",
          background: "#fefce8",
          borderRadius: 10,
          border: "1px solid #fde68a",
          fontSize: 12, color: "#92400e",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <span>
            For best results: <strong>good lighting</strong>, position your hand
            <strong> 30–60 cm</strong> from the camera, and use <strong>one hand only</strong>.
          </span>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px 18px",
          display: "flex", gap: 10, alignItems: "center",
          borderTop: "1px solid #f0f0f0",
        }}>
          <button
            onClick={onSkip}
            style={{
              padding: "10px 18px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#f9fafb",
              color: "#6b7280", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f9fafb")}
          >
            Skip
          </button>
          <button
            onClick={onEnable}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              background: "linear-gradient(135deg,#1e40af,#2563eb)",
              color: "#fff", border: "none",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.92")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <CheckCircle size={17} />
            Enable Gesture Control
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  Main Component
// ══════════════════════════════════════════════════════════════════════════
const HandGestureController = () => {
  // ── UI state ─────────────────────────────────────────────────────────────
  const [showTutorial, setShowTutorial] = useState(false);   // NEW: tutorial modal
  const [enabled,      setEnabled]      = useState(false);
  const [ready,        setReady]        = useState(false);
  const [showKB,       setShowKB]       = useState(false);
  const [kbText,       setKbText]       = useState("");
  const [label,        setLabel]        = useState("Show your hand...");
  const [scrollDir,    setScrollDir]    = useState<"up" | "down" | null>(null);
  const [cur,          setCur]          = useState({ x: -200, y: -200 });
  const [dwellPct,     setDwellPct]     = useState(0);
  const [hovKey,       setHovKey]       = useState<string | null>(null);
  const [fps,          setFps]          = useState(0);
  const [showGuide,    setShowGuide]    = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef  = useRef<any>(null);
  const camRef    = useRef<any>(null);

  // Smoothed cursor
  const sX = useRef(0.5);
  const sY = useRef(0.5);

  // Dwell-click state
  const dwellX     = useRef(-999);
  const dwellY     = useRef(-999);
  const dwellCount = useRef(0);
  const dwellFired = useRef(false);

  // Other refs
  const prevY        = useRef<number | null>(null);
  const swipeStartX  = useRef<number | null>(null);
  const swipeCnt     = useRef<"left" | "right" | null>(null);
  const swipeCntN    = useRef(0);
  const swipeCD      = useRef(0);
  const scrollAcc    = useRef(0);
  const kbRefs       = useRef<Map<string, HTMLDivElement>>(new Map());
  const showKBRef    = useRef(false);
  const kbTextRef    = useRef("");
  const victoryCnt   = useRef(0);
  const kbPinchCD    = useRef(0);
  const fpsFrames    = useRef(0);
  const fpsTimer     = useRef(0);

  useEffect(() => { showKBRef.current = showKB; }, [showKB]);
  useEffect(() => { kbTextRef.current = kbText; }, [kbText]);

  // ── Draw skeleton ────────────────────────────────────────────────────────
  const drawSkeleton = useCallback((lm: Landmark[], w: number, h: number, ctx: CanvasRenderingContext2D) => {
    const CONN = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[0,17],[17,18],[18,19],[19,20],
    ];
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2;
    CONN.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * w, lm[a].y * h);
      ctx.lineTo(lm[b].x * w, lm[b].y * h);
      ctx.strokeStyle = (a <= 4 || b <= 4) ? "rgba(249,115,22,0.7)" : "rgba(99,102,241,0.55)";
      ctx.stroke();
    });
    lm.forEach((p, i) => {
      ctx.beginPath();
      const r = i === 8 ? 8 : i === 4 ? 7 : [0,5,9,13,17].includes(i) ? 5 : 3;
      ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
      ctx.fillStyle = i === 8 ? "#818cf8" : i === 4 ? "#fb923c" : i === 0 ? "#e2e8f0" : "rgba(255,255,255,0.6)";
      ctx.fill();
    });
  }, []);

  // ── Ripple ───────────────────────────────────────────────────────────────
  const ripple = useCallback((cx: number, cy: number) => {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;left:${cx - 28}px;top:${cy - 28}px;
      width:56px;height:56px;border-radius:50%;
      border:3px solid #22c55e;background:rgba(34,197,94,0.18);
      pointer-events:none;z-index:999999;
      transition:transform 0.4s ease-out,opacity 0.4s ease-out;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = "scale(2.4)"; el.style.opacity = "0"; });
    setTimeout(() => el.remove(), 420);
  }, []);

  // ── Fire click ───────────────────────────────────────────────────────────
  const fireClick = useCallback((cx: number, cy: number) => {
    const dot = document.getElementById("hgc-cursor");
    if (dot) dot.style.display = "none";
    const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
    if (dot) dot.style.display = "block";
    if (!el) return;

    const target = (
      el.closest("a") ||
      el.closest("button") ||
      el.closest("[role='button']") ||
      el.closest("[role='link']") ||
      el.closest("input") ||
      el.closest("select") ||
      el.closest("label") ||
      el
    ) as HTMLElement;

    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (anchor && anchor.href) {
      const url = new URL(anchor.href, window.location.href);
      const isSameOrigin = url.origin === window.location.origin;
      const hasModifier  = anchor.target === "_blank" || anchor.rel?.includes("external");
      if (isSameOrigin && !hasModifier) {
        window.history.pushState({}, "", url.pathname + url.search + url.hash);
        window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
        ripple(cx, cy);
        setLabel("✅ Navigated!");
        return;
      }
    }

    const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
    target.dispatchEvent(new PointerEvent("pointerdown", opts));
    target.dispatchEvent(new MouseEvent("mousedown",    opts));
    target.dispatchEvent(new PointerEvent("pointerup",  opts));
    target.dispatchEvent(new MouseEvent("mouseup",      opts));
    target.dispatchEvent(new MouseEvent("click",        opts));

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.focus();
    }
    ripple(cx, cy);
    setLabel("✅ Clicked!");
  }, [ripple]);

  // ── Per-frame handler ────────────────────────────────────────────────────
  const onFrame = useCallback((lm: Landmark[]) => {
    fpsFrames.current++;
    const now = performance.now();
    if (now - fpsTimer.current >= 1000) {
      setFps(fpsFrames.current);
      fpsFrames.current = 0;
      fpsTimer.current  = now;
    }

    const g = analyze(lm);

    sX.current = lerp(sX.current, 1 - g.t8.x, SMOOTH);
    sY.current = lerp(sY.current, g.t8.y,      SMOOTH);
    const cx = sX.current * window.innerWidth;
    const cy = sY.current * window.innerHeight;
    setCur({ x: cx, y: cy });

    if (swipeCD.current > 0) swipeCD.current--;
    if (kbPinchCD.current > 0) kbPinchCD.current--;

    // VICTORY → toggle keyboard
    if (g.isVictory) {
      victoryCnt.current++;
      if (victoryCnt.current >= GESTURE_CONFIRM && swipeCD.current <= 0) {
        setShowKB(v => !v);
        swipeCD.current = 35;
        setLabel("✌ Keyboard toggled");
        victoryCnt.current = 0;
        dwellCount.current = 0;
        dwellFired.current = false;
        setDwellPct(0);
        return;
      }
      setLabel("✌ Hold — toggle keyboard");
    } else {
      victoryCnt.current = 0;
    }

    // KEYBOARD MODE
    if (showKBRef.current) {
      let found: string | null = null;
      kbRefs.current.forEach((el, key) => {
        const r = el.getBoundingClientRect();
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) found = key;
      });
      setHovKey(found);

      if (found) {
        setLabel(`Key: ${found} — hold still to type`);
        const dist = pxDist(cx, cy, dwellX.current, dwellY.current);
        if (dist > DWELL_RADIUS) {
          dwellX.current = cx; dwellY.current = cy;
          dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
        } else {
          dwellCount.current++;
          setDwellPct(Math.min(dwellCount.current / DWELL_FRAMES, 1) * 100);
          if (dwellCount.current >= DWELL_FRAMES && !dwellFired.current) {
            dwellFired.current = true;
            if      (found === "⌫")    setKbText(t => t.slice(0, -1));
            else if (found === "CLEAR") setKbText("");
            else if (found === "SPACE") setKbText(t => t + " ");
            else if (found === "ENTER") {
              let inp = document.activeElement as HTMLInputElement;
              if (!inp || !["INPUT", "TEXTAREA"].includes(inp.tagName)) {
                inp = document.querySelector<HTMLInputElement>(
                  "input[type='text'],input[type='search'],input[type='email'],input[type='password'],input:not([type])"
                ) as HTMLInputElement;
              }
              if (inp) {
                inp.focus();
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                if (nativeSetter) nativeSetter.call(inp, kbTextRef.current);
                else inp.value = kbTextRef.current;
                inp.dispatchEvent(new Event("input",  { bubbles: true }));
                inp.dispatchEvent(new Event("change", { bubbles: true }));
                inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
              }
              setShowKB(false);
              setKbText("");
            } else setKbText(t => t + found!);
            ripple(cx, cy);
          }
        }
      } else {
        setLabel("☝ Point at a key");
        dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
      }
      return;
    }

    // OPEN HAND → scroll
    if (g.isOpen) {
      dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
      if (prevY.current !== null) {
        const dy = (g.t8.y - prevY.current) * SCROLL_SENS;
        scrollAcc.current += dy;
        if (Math.abs(scrollAcc.current) > SCROLL_DEADZONE) {
          window.scrollBy({ top: scrollAcc.current, behavior: "auto" });
          setScrollDir(scrollAcc.current > 0 ? "down" : "up");
          scrollAcc.current = 0;
        }
        if      (dy < -1.5) setLabel("↑ Scrolling UP");
        else if (dy >  1.5) setLabel("↓ Scrolling DOWN");
        else                setLabel("🖐 Open hand — move up/down to scroll");
      }
      prevY.current = g.t8.y;
      swipeStartX.current = null; swipeCnt.current = null; swipeCntN.current = 0;
      return;
    }
    prevY.current = null;
    setScrollDir(null);

    // SWIPE → navigate
    if (swipeStartX.current === null) swipeStartX.current = g.wrist.x;
    const sd = swipeStartX.current - g.wrist.x;
    if (Math.abs(sd) > SWIPE_THRESH && swipeCD.current <= 0) {
      const dir: "left" | "right" = sd > 0 ? "left" : "right";
      if (swipeCnt.current === dir) swipeCntN.current++;
      else { swipeCnt.current = dir; swipeCntN.current = 1; }
      if (swipeCntN.current >= GESTURE_CONFIRM) {
        dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
        if (dir === "left") { setLabel("👈 Going Back");    window.history.back(); }
        else                { setLabel("👉 Going Forward"); window.history.forward(); }
        swipeStartX.current = g.wrist.x;
        swipeCnt.current = null; swipeCntN.current = 0;
        swipeCD.current = SWIPE_CD;
      } else {
        setLabel(dir === "left" ? "👈 Swipe further left for Back" : "👉 Swipe further right for Forward");
      }
      return;
    } else {
      swipeCnt.current = null; swipeCntN.current = 0;
    }

    // POINT + DWELL → click
    if (g.isPoint) {
      const dist = pxDist(cx, cy, dwellX.current, dwellY.current);
      if (dist > DWELL_RADIUS) {
        dwellX.current = cx; dwellY.current = cy;
        dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
        setLabel("☝ Point — hold still over element to click");
      } else {
        dwellCount.current++;
        const pct = Math.min(dwellCount.current / DWELL_FRAMES, 1) * 100;
        setDwellPct(pct);
        if (dwellCount.current >= DWELL_FRAMES && !dwellFired.current) {
          dwellFired.current = true;
          fireClick(cx, cy);
          setDwellPct(100);
        } else if (!dwellFired.current) {
          const remaining = Math.ceil((DWELL_FRAMES - dwellCount.current) / 30);
          setLabel(dwellCount.current > DWELL_FRAMES * 0.5 ? "🎯 Almost there..." : `☝ Hold still to click (${remaining}s)`);
        } else {
          setLabel("✅ Clicked! Move finger to click again");
        }
      }
      return;
    }

    dwellCount.current = 0; dwellFired.current = false; setDwellPct(0);
    setLabel("Show your hand...");
  }, [fireClick, ripple]);

  // ── Start camera ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: "user", frameRate: { ideal: 30, max: 30 } },
      });
      streamRef.current = stream;
      const vid = videoRef.current!;
      vid.srcObject = stream;

      const hw = await import("@mediapipe/hands" as any);
      const cw = await import("@mediapipe/camera_utils" as any);
      const HandsConstructor  = hw.Hands  || hw.default?.Hands  || (window as any).Hands;
      const CameraConstructor = cw.Camera || cw.default?.Camera || (window as any).Camera;

      const hands = new HandsConstructor({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1, modelComplexity: 1,
        minDetectionConfidence: 0.85, minTrackingConfidence: 0.80,
      });

      hands.onResults((res: any) => {
        const canvas = canvasRef.current;
        const video  = videoRef.current;
        if (!canvas || !video) return;
        canvas.width  = video.videoWidth  || 480;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d")!;
        if (res.multiHandLandmarks?.length > 0) {
          drawSkeleton(res.multiHandLandmarks[0], canvas.width, canvas.height, ctx);
          onFrame(res.multiHandLandmarks[0]);
          setReady(true);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setLabel("Show your hand to the camera");
          setScrollDir(null);
          setCur({ x: -200, y: -200 });
          setDwellPct(0);
          prevY.current = null; swipeStartX.current = null;
          swipeCnt.current = null; swipeCntN.current = 0;
          victoryCnt.current = 0;
          dwellCount.current = 0; dwellFired.current = false;
        }
      });

      handsRef.current = hands;
      const cam = new CameraConstructor(vid, {
        onFrame: async () => { await hands.send({ image: vid }); },
        width: 480, height: 360,
      });
      camRef.current = cam;
      await cam.start();
      fpsTimer.current = performance.now();
      setReady(true);
      setShowGuide(true);
    } catch (err) {
      console.error("HandGestureController:", err);
      setLabel("Camera denied — allow in browser settings");
    }
  }, [drawSkeleton, onFrame]);

  // ── Stop camera ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    camRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    handsRef.current?.close();
    streamRef.current = null;
    setReady(false); setShowKB(false); setShowGuide(false);
    setScrollDir(null); setCur({ x: -200, y: -200 });
    setDwellPct(0);
  }, []);

  // ── Toggle: FAB click ────────────────────────────────────────────────────
  // If already enabled → disable immediately.
  // If disabled → show tutorial modal first.
  const toggle = useCallback(() => {
    if (enabled) {
      stopCamera();
      setEnabled(false);
    } else {
      setShowTutorial(true);   // show modal; camera starts only after "Enable" click
    }
  }, [enabled, stopCamera]);

  // ── Tutorial modal: user clicked "Enable Gesture Control" ───────────────
  const handleEnableFromModal = useCallback(() => {
    setShowTutorial(false);
    setEnabled(true);
    startCamera();
  }, [startCamera]);

  // ── Tutorial modal: user clicked "Skip" or backdrop ─────────────────────
  const handleSkipModal = useCallback(() => {
    setShowTutorial(false);
    // camera does NOT start
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Dwell ring SVG ───────────────────────────────────────────────────────
  const RING_R  = 22;
  const RING_C  = RING_R + 4;
  const RING_SZ = RING_C * 2;
  const circ    = 2 * Math.PI * RING_R;
  const dash    = (dwellPct / 100) * circ;

  // ══════════════════════════════════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Tutorial Video Modal ───────────────────────────────────────── */}
      {showTutorial && (
        <TutorialModal
          onEnable={handleEnableFromModal}
          onSkip={handleSkipModal}
        />
      )}

      {/* ── Cursor dot ────────────────────────────────────────────────── */}
      <div
        id="hgc-cursor"
        style={{
          position: "fixed", left: cur.x, top: cur.y,
          width: 14, height: 14, borderRadius: "50%",
          background: "rgba(99,102,241,0.9)",
          border: "2.5px solid #818cf8",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none", zIndex: 999998,
          boxShadow: "0 0 0 4px rgba(99,102,241,0.15)",
          display: enabled && cur.x > 0 ? "block" : "none",
        }}
      />

      {/* ── Dwell ring ────────────────────────────────────────────────── */}
      {enabled && cur.x > 0 && dwellPct > 0 && (
        <svg
          style={{
            position: "fixed",
            left: cur.x - RING_SZ / 2,
            top:  cur.y - RING_SZ / 2,
            width: RING_SZ, height: RING_SZ,
            pointerEvents: "none", zIndex: 999997,
            transform: "rotate(-90deg)",
          }}
        >
          <circle cx={RING_C} cy={RING_C} r={RING_R}
            fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
          <circle cx={RING_C} cy={RING_C} r={RING_R}
            fill="none"
            stroke={dwellPct >= 100 ? "#22c55e" : "#818cf8"}
            strokeWidth={3}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.05s linear, stroke 0.2s" }}
          />
        </svg>
      )}

      {/* ── Scroll direction indicator ────────────────────────────────── */}
      {enabled && scrollDir && (
        <div style={{
          position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)",
          background: "rgba(99,102,241,0.92)", color: "#fff",
          borderRadius: 24, padding: "8px 10px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          zIndex: 999996, fontSize: 12, fontWeight: 700,
          boxShadow: "0 2px 12px rgba(99,102,241,0.5)",
        }}>
          {scrollDir === "up" ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          {scrollDir === "up" ? "UP" : "DN"}
        </div>
      )}

      {/* ── Camera preview ────────────────────────────────────────────── */}
      {enabled && (
        <div style={{
          position: "fixed", top: 12, left: 12, zIndex: 999995,
          borderRadius: 12, overflow: "hidden",
          border: "2px solid rgba(99,102,241,0.65)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
          width: 200, background: "#0a0a14",
        }}>
          <video ref={videoRef} autoPlay muted playsInline
            style={{ width: "100%", display: "block", transform: "scaleX(-1)", opacity: 0.9 }} />
          <canvas ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scaleX(-1)" }} />

          <div style={{ position: "absolute", top: 4, left: 6, right: 28, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              background: ready ? "rgba(34,197,94,0.85)" : "rgba(245,158,11,0.85)",
              color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8,
            }}>
              {ready ? "LIVE" : "LOADING"}
            </span>
            {ready && (
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, display: "flex", alignItems: "center", gap: 2 }}>
                <Wifi size={8}/>{fps}fps
              </span>
            )}
          </div>

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.72)", color: "#e0e7ff",
            fontSize: 10, padding: "4px 6px", textAlign: "center", lineHeight: 1.4, fontWeight: 500,
          }}>
            {label}
          </div>

          <button onClick={toggle} style={{
            position: "absolute", top: 4, right: 4,
            background: "rgba(0,0,0,0.6)", border: "none",
            borderRadius: "50%", width: 22, height: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}>
            <X size={12}/>
          </button>
        </div>
      )}

      {/* ── Gesture Rules Panel ───────────────────────────────────────── */}
      {enabled && showGuide && (
        <div style={{
          position: "fixed",
          bottom: showKB ? 320 : 88,
          left: 16, width: 266,
          background: "rgba(10,10,22,0.97)",
          borderRadius: 14,
          border: "1px solid rgba(99,102,241,0.4)",
          padding: "14px 14px 12px",
          zIndex: 999993,
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          transition: "bottom 0.3s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              <Hand size={14}/> Gesture Rules
            </span>
            <button onClick={() => setShowGuide(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 2 }}>
              <X size={14}/>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {GESTURE_RULES.map(rule => (
              <div key={rule.title} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 10,
                border: `1px solid ${rule.color}45`,
                padding: "8px 10px", display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <div style={{
                  fontSize: 18, minWidth: 30, height: 30, borderRadius: 8,
                  background: `${rule.color}20`, border: `1px solid ${rule.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {rule.emoji}
                </div>
                <div>
                  <div style={{ color: rule.color, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{rule.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 10, lineHeight: 1.5 }}>{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.6 }}>
            💡 Good lighting · 30–60 cm from camera · One hand only
          </div>
        </div>
      )}

      {/* ── Virtual keyboard ──────────────────────────────────────────── */}
      {enabled && showKB && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(10,10,20,0.97)",
          borderTop: "1.5px solid rgba(99,102,241,0.45)",
          padding: "10px 8px 18px", zIndex: 999994,
          backdropFilter: "blur(16px)",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.07)", borderRadius: 8,
            padding: "8px 14px", marginBottom: 8, fontSize: 15,
            color: "#e0e7ff", minHeight: 38,
            border: "1px solid rgba(99,102,241,0.4)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Keyboard size={13} style={{ opacity: 0.45, flexShrink: 0 }}/>
            <span style={{ flex: 1 }}>
              {kbText || <span style={{ opacity: 0.35 }}>Point at keys, hold still to type...</span>}
            </span>
            <button onClick={() => setShowKB(false)}
              style={{ background: "none", border: "none", color: "#fff", opacity: 0.5, cursor: "pointer" }}>
              <X size={14}/>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              ["1","2","3","4","5","6","7","8","9","0"],
              ["Q","W","E","R","T","Y","U","I","O","P"],
              ["A","S","D","F","G","H","J","K","L"],
              ["Z","X","C","V","B","N","M","⌫"],
              ["SPACE","CLEAR","ENTER"],
            ].map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                {row.map(key => {
                  const hov  = hovKey === key;
                  const wide = key === "SPACE" || key === "ENTER" || key === "CLEAR";
                  return (
                    <div key={key}
                      ref={el => { if (el) kbRefs.current.set(key, el); else kbRefs.current.delete(key); }}
                      onClick={() => {
                        if      (key === "⌫")    setKbText(t => t.slice(0, -1));
                        else if (key === "CLEAR") setKbText("");
                        else if (key === "SPACE") setKbText(t => t + " ");
                        else if (key === "ENTER") setShowKB(false);
                        else setKbText(t => t + key);
                      }}
                      style={{
                        minWidth: wide ? 80 : 28, flex: wide ? 2 : 1, maxWidth: wide ? 130 : 38,
                        height: 34, borderRadius: 6,
                        border: hov ? "2px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
                        background: hov ? "rgba(99,102,241,0.88)" : "rgba(255,255,255,0.05)",
                        color: hov ? "#fff" : "#c7d2fe",
                        fontSize: 11, fontWeight: 500,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.1s",
                        transform: hov ? "scale(1.1)" : "scale(1)",
                        userSelect: "none",
                        boxShadow: hov ? "0 0 10px rgba(99,102,241,0.4)" : "none",
                      }}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            ☝ point at key · hold still to type · ✌ victory to close
          </div>
        </div>
      )}

      {/* ── FAB + Info button ─────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: showKB ? 310 : 24, left: 24,
        zIndex: 999994, display: "flex", gap: 8, alignItems: "flex-end",
        transition: "bottom 0.3s",
      }}>
        <button
          onClick={toggle}
          title={enabled ? "Disable gesture control" : "Enable gesture control"}
          style={{
            width: 52, height: 52, borderRadius: "50%", border: "none",
            background: enabled
              ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
              : "linear-gradient(135deg,#1d4ed8,#2563eb)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: enabled
              ? "0 4px 24px rgba(99,102,241,0.6)"
              : "0 4px 16px rgba(37,99,235,0.45)",
            transition: "all 0.2s", position: "relative",
          }}
        >
          <Hand size={22}/>
          {enabled && (
            <span style={{
              position: "absolute", top: -2, right: -2,
              width: 12, height: 12, borderRadius: "50%",
              background: ready ? "#22c55e" : "#f59e0b",
              border: "2px solid #fff", transition: "background 0.3s",
            }}/>
          )}
        </button>

        {enabled && (
          <button
            onClick={() => setShowGuide(v => !v)}
            title="Gesture guide"
            style={{
              width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
              background: showGuide ? "rgba(99,102,241,0.9)" : "rgba(20,20,40,0.9)",
              border: `1px solid ${showGuide ? "#6366f1" : "rgba(99,102,241,0.4)"}`,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)", transition: "all 0.2s",
            } as React.CSSProperties}
          >
            <Info size={15}/>
          </button>
        )}
      </div>
    </>
  );
};

export default HandGestureController;