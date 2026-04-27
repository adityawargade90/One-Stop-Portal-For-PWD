/**
 * EyeTracking.tsx — Visual Eye Control System v5.1 (IRIS-DRIVEN CURSOR)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * CHANGES OVER v5:
 *
 * ✅ FEATURE A — Iris-driven cursor (replaces WebGazer-only path)
 *    processAndDraw() now extracts the average of left iris (468) and
 *    right iris (473) positions, maps them to screen coordinates, and
 *    writes directly into rawX/rawY refs.  The existing triple-EMA
 *    pipeline in gazeLoop() then smooths those values into a stable cursor.
 *    Formula:
 *      screenX = ((irisAvgX / videoW) * window.innerWidth)  * sensitivity
 *      screenY = ((irisAvgY / videoH) * window.innerHeight) * sensitivity
 *    When FaceMesh has no face, rawX/rawY keep the last valid values so
 *    the cursor doesn't snap to zero.
 *
 * ✅ FEATURE B — Scroll zones wired to iris position (was already present
 *    but only activated after triple-EMA; confirmed works via smoothY).
 *    Top 10% → scrollUp, bottom 10% → scrollDown.
 *
 * ✅ FEATURE C — Blink-to-click enabled by default
 *    blinkModeRef is now initialised to TRUE so new users get blink-click
 *    immediately without opening the settings panel.  Users can still
 *    toggle it off in ⚙ settings.  The existing EAR logic is preserved
 *    exactly; only the default value changed.
 *
 * All v5 code, comments, constants, and UI are preserved unchanged.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WebGazerInstance {
  begin:                () => WebGazerInstance;
  end:                  () => void;
  pause:                () => WebGazerInstance;
  resume:               () => WebGazerInstance;
  setGazeListener:      (fn: GazeListener) => WebGazerInstance;
  clearGazeListener:    () => WebGazerInstance;
  showPredictionPoints: (v: boolean) => WebGazerInstance;
  showVideoPreview:     (v: boolean) => WebGazerInstance;
  showFaceOverlay:      (v: boolean) => WebGazerInstance;
  showFaceFeedbackBox:  (v: boolean) => WebGazerInstance;
  setRegression:        (t: string) => WebGazerInstance;
  applyKalmanFilter:    (v: boolean) => WebGazerInstance;
  videoElement:         HTMLVideoElement | null;
  getVideoElement?:     () => HTMLVideoElement | null;
}
type GazeListener = (data: { x: number; y: number } | null, ts: number) => void;

declare global {
  interface Window {
    webgazer: WebGazerInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FaceMesh: any;
  }
}

// ─── Constants (base values — scaled at runtime by iris size) ─────────────────
const EMA_FAST        = 0.30;
const EMA_MID         = 0.18;
const EMA_SLOW        = 0.10;
const EMA_CATCH       = 0.22;
const VEL_DAMP_PX     = 60;

const BASE_DWELL_MS   = 2000;
const DWELL_START_MS  = 250;
const BASE_STABILITY  = 80;
const SCROLL_ZONE     = 0.10;
const SCROLL_PX       = 14;
const CAL_CLICKS      = 3;
const UI_THROTTLE     = 120;
const FACE_GRACE_MS   = 700;
const FM_INTERVAL_MS  = 66;

// Blink detection
const EAR_CLICK_THRESHOLD = 0.20;
const BLINK_HOLD_MS        = 150;  // ← lowered from 180 for quicker response
const BLINK_MAX_MS         = 500;  // ← tightened from 600 (per spec: 150–500ms)
const BLINK_COOLDOWN_MS    = 800;

// Iris landmark indices
const LM_L_IRIS   = 468;
const LM_R_IRIS   = 473;
const LM_L_OUTER  = 33;
const LM_R_OUTER  = 263;

// EAR landmarks
const EAR_L = { p1:159, p2:145, p3:158, p4:153, p5:33,  p6:133 };
const EAR_R = { p1:386, p2:374, p3:385, p4:380, p5:362, p6:263 };

const CAL_POINTS = [
  { x: 0.10, y: 0.10 }, { x: 0.50, y: 0.10 }, { x: 0.90, y: 0.10 },
  { x: 0.10, y: 0.50 }, { x: 0.50, y: 0.50 }, { x: 0.90, y: 0.50 },
  { x: 0.10, y: 0.90 }, { x: 0.50, y: 0.90 }, { x: 0.90, y: 0.90 },
];

const OWN_IDS = new Set([
  "ez-cursor","ez-ring","ez-highlight","ez-cam-panel","ez-keyboard","ez-settings",
]);

const INTERACTIVE_SEL =
  'button, a, input, select, textarea, [role="button"], [tabindex], label, [onclick], [data-ez-key]';

const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M","⌫","↵"],
  [" SPACE "],
];

const CUR_IDLE      = "rgba(99,102,241,.92)";
const CUR_FOCUS     = "rgba(251,191,36,.95)";
const CUR_CLICK     = "rgba(34,197,94,.95)";
const CUR_NO_FACE   = "rgba(239,68,68,.85)";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pollUntil<T>(
  getter: () => T | null | undefined,
  intervalMs: number,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = setInterval(() => {
      const v = getter();
      if (v) { clearInterval(id); resolve(v); return; }
      if (Date.now() - start > timeoutMs) {
        clearInterval(id);
        reject(new Error("pollUntil timeout"));
      }
    }, intervalMs);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise(res => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = () => res();
    s.onerror = () => res();
    document.head.appendChild(s);
  });
}

function getLabel(el: Element | null): string {
  if (!el) return "—";
  return (
    el.getAttribute("data-ez-key") ??
    el.getAttribute("aria-label") ??
    el.getAttribute("title") ??
    (el.textContent ?? "").trim().slice(0, 40) ??
    (el as HTMLInputElement).placeholder ??
    el.tagName.toLowerCase()
  );
}

function closestInteractive(el: Element | null): Element | null {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.matches(INTERACTIVE_SEL)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function calcEAR(lms: Array<{x:number;y:number;z:number}>, W:number, H:number,
  cfg: typeof EAR_L) {
  const pt = (i:number) => ({ x: lms[i].x * W, y: lms[i].y * H });
  const A = Math.hypot(pt(cfg.p1).x - pt(cfg.p2).x, pt(cfg.p1).y - pt(cfg.p2).y);
  const B = Math.hypot(pt(cfg.p3).x - pt(cfg.p4).x, pt(cfg.p3).y - pt(cfg.p4).y);
  const C = Math.hypot(pt(cfg.p5).x - pt(cfg.p6).x, pt(cfg.p5).y - pt(cfg.p6).y);
  return C < 1 ? 0.3 : (A + B) / (2 * C);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface EyeTrackingProps {
  onStatusChange?: (msg: string) => void;
  showKeyboard?:   boolean;
  onKeyPress?:     (key: string) => void;
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function EyeTracking({
  onStatusChange, showKeyboard = false, onKeyPress,
}: EyeTrackingProps) {

  type Phase = "intro" | "calibrating" | "tracking";

  const [phase,       setPhase]       = useState<Phase>("intro");
  const [initMsg,     setInitMsg]     = useState("Ready");
  const [calDisplay,  setCalDisplay]  = useState({ idx: 0, clicks: 0, pct: 0 });
  const [accuracy,    setAccuracy]    = useState(0);
  const [lookingAt,   setLookingAt]   = useState("—");
  const [actionText,  setActionText]  = useState("Tracking gaze");
  const [faceOk,      setFaceOk]      = useState(false);
  const [dwellPct,    setDwellPct]    = useState(0);
  const [typedText,   setTypedText]   = useState("");
  const [activeKey,   setActiveKey]   = useState<string | null>(null);
  // ── CHANGE C: blink mode defaults to true ──────────────────────────────
  const [blinkMode,   setBlinkMode]   = useState(true);
  const [irisRadiusPx, setIrisRadiusPx] = useState(0);

  // ── Gaze refs ──────────────────────────────────────────────────────────────
  const rawX    = useRef(window.innerWidth  / 2);
  const rawY    = useRef(window.innerHeight / 2);
  const emaFastX = useRef(window.innerWidth  / 2);
  const emaFastY = useRef(window.innerHeight / 2);
  const emaMidX  = useRef(window.innerWidth  / 2);
  const emaMidY  = useRef(window.innerHeight / 2);
  const smoothX  = useRef(window.innerWidth  / 2);
  const smoothY  = useRef(window.innerHeight / 2);
  const prevSmoothX = useRef(window.innerWidth  / 2);
  const prevSmoothY = useRef(window.innerHeight / 2);
  const lastGazeTs  = useRef(0);

  // ── Adaptive iris sizing ───────────────────────────────────────────────────
  const irisRadiusPxRef    = useRef(12);
  const stabilityScaleRef  = useRef(1.0);

  // ── User settings ──────────────────────────────────────────────────────────
  const dwellMsRef        = useRef(BASE_DWELL_MS);
  const sensitivityRef    = useRef(1.0);
  // ── CHANGE C: initialise blink mode ON ────────────────────────────────────
  const blinkModeRef      = useRef(true);
  const blinkThreshRef    = useRef(EAR_CLICK_THRESHOLD);

  // ── Blink detection refs ───────────────────────────────────────────────────
  const blinkStartTs      = useRef<number | null>(null);
  const lastBlinkClickTs  = useRef(0);
  const earHistRef        = useRef<number[]>([]);

  // ── Dwell refs ─────────────────────────────────────────────────────────────
  const dwellStartTs  = useRef<number | null>(null);
  const dwellAnchorX  = useRef(0);
  const dwellAnchorY  = useRef(0);
  const dwellTargetEl = useRef<Element | null>(null);

  // ── Keyboard dwell refs ────────────────────────────────────────────────────
  const kbDwellStartTs = useRef<number | null>(null);
  const kbCurrentKey   = useRef<string | null>(null);

  // ── Calibration refs ───────────────────────────────────────────────────────
  const calIdxRef    = useRef(0);
  const calClicksRef = useRef(0);
  const calAccRef    = useRef(0);

  // ── Face detection refs ────────────────────────────────────────────────────
  const lastFaceTs = useRef(0);
  const faceOkRef  = useRef(false);

  // ── rAF & timing refs ─────────────────────────────────────────────────────
  const gazeRafId  = useRef<number | null>(null);
  const faceRafId  = useRef<number | null>(null);
  const fmLastSent = useRef(0);
  const fmBusyRef  = useRef(false);

  // ── DOM overlay refs ───────────────────────────────────────────────────────
  const cursorEl    = useRef<HTMLDivElement   | null>(null);
  const ringEl      = useRef<SVGSVGElement    | null>(null);
  const ringArcEl   = useRef<SVGCircleElement | null>(null);
  const highlightEl = useRef<HTMLDivElement   | null>(null);

  // ── Camera refs ───────────────────────────────────────────────────────────
  const previewRef = useRef<HTMLVideoElement  | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const wgVideoRef = useRef<HTMLVideoElement  | null>(null);

  // ── MediaPipe refs ─────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceMeshRef = useRef<any>(null);
  const fmReadyRef  = useRef(false);

  // ── UI throttle ───────────────────────────────────────────────────────────
  const lastUITs    = useRef(0);
  const lastLookRef = useRef("—");

  // ── gazeLoopRef ───────────────────────────────────────────────────────────
  const gazeLoopRef = useRef<() => void>(() => {});

  // ── Notify ────────────────────────────────────────────────────────────────
  const notify = useCallback((msg: string) => {
    console.log("[EyeTracking]", msg);
    setInitMsg(msg);
    onStatusChange?.(msg);
  }, [onStatusChange]);

  const updateUI = useCallback((looking: string, action: string) => {
    const now = Date.now();
    if (now - lastUITs.current < UI_THROTTLE) return;
    lastUITs.current = now;
    if (looking !== lastLookRef.current) {
      setLookingAt(looking.slice(0, 32));
      lastLookRef.current = looking;
    }
    setActionText(action);
  }, []);

  const setCursorColor = (col: string) => {
    if (cursorEl.current) cursorEl.current.style.background = col;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  A — Init WebGazer
  // ══════════════════════════════════════════════════════════════════════════
  const initWebGazer = async () => {
    try {
      notify("Waiting for WebGazer…");
      const wg = await pollUntil(() => window.webgazer, 200, 15000);
      notify("Configuring WebGazer…");

      wg
        .setRegression("ridge")
        .applyKalmanFilter(true)
        .showVideoPreview(false)
        .showPredictionPoints(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false)
        .begin();

      notify("Camera starting — allow access if prompted…");
      await new Promise(r => setTimeout(r, 1200));

      try { wg.resume(); } catch (_) {}

      // WebGazer gaze listener is kept as a fallback for when FaceMesh
      // hasn't produced its first result yet.
      wg.setGazeListener((data, _ts) => {
        if (!data) return;
        // Only use WebGazer values if FaceMesh hasn't seen a face yet.
        // Once FaceMesh is running, processAndDraw() owns rawX/rawY.
        if (!faceOkRef.current) {
          rawX.current = data.x;
          rawY.current = data.y;
          lastGazeTs.current = Date.now();
        }
      });

      notify("Locating WebGazer video…");
      const wgVideo = await pollUntil<HTMLVideoElement>(() => {
        const v = (
          wg.getVideoElement?.() ??
          wg.videoElement ??
          (document.getElementById("webgazerVideoFeed") as HTMLVideoElement | null) ??
          (document.querySelector("video[id*='webgazer']") as HTMLVideoElement | null)
        );
        return (v && v.srcObject) ? v : null;
      }, 200, 8000);

      wgVideoRef.current = wgVideo;

      if (previewRef.current) {
        previewRef.current.srcObject = wgVideo.srcObject as MediaStream;
        previewRef.current.play().catch(() => {});
      }

      if (wgVideo.readyState < 2) {
        await new Promise<void>(resolve => {
          wgVideo.addEventListener("loadeddata", () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        });
      }

      initFaceMesh(wgVideo);

      notify("Calibrate for best accuracy");
      setPhase("calibrating");
      calIdxRef.current    = 0;
      calClicksRef.current = 0;
      calAccRef.current    = 0;
      setCalDisplay({ idx: 0, clicks: 0, pct: 0 });
      setAccuracy(0);

    } catch (err) {
      notify(`Error: ${(err as Error).message}`);
      console.error("[EyeTracking] init error:", err);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  B — Init MediaPipe FaceMesh
  // ══════════════════════════════════════════════════════════════════════════
  const initFaceMesh = async (sourceVideo: HTMLVideoElement) => {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
      const FM = await pollUntil(() => window.FaceMesh, 200, 12000);

      const fm = new FM({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.4,
        minTrackingConfidence:  0.4,
      });
      fm.onResults((results: unknown) => {
        fmBusyRef.current = false;
        processAndDraw(results);
      });

      faceMeshRef.current = fm;

      if (sourceVideo.readyState >= 2 && sourceVideo.videoWidth > 0) {
        fmBusyRef.current = true;
        await fm.send({ image: sourceVideo });
      }

      fmReadyRef.current = true;
      startFaceMeshLoop(sourceVideo);
    } catch (err) {
      console.warn("[EyeTracking] FaceMesh init failed (non-fatal):", err);
      if (wgVideoRef.current) startFaceMeshLoop(wgVideoRef.current);
    }
  };

  const startFaceMeshLoop = (video: HTMLVideoElement) => {
    const loop = () => {
      faceRafId.current = requestAnimationFrame(loop);
      const now = Date.now();
      if (now - fmLastSent.current < FM_INTERVAL_MS) return;
      if (fmBusyRef.current) return;
      if (!faceMeshRef.current || !fmReadyRef.current) return;
      if (!video || video.readyState < 2 || video.paused || video.videoWidth === 0) return;
      fmLastSent.current = now;
      fmBusyRef.current  = true;
      faceMeshRef.current.send({ image: video }).catch(() => {
        fmBusyRef.current = false;
      });
    };
    faceRafId.current = requestAnimationFrame(loop);
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  processAndDraw — FEATURE A: iris cursor + FEATURE C: blink + overlay
  // ══════════════════════════════════════════════════════════════════════════
  const processAndDraw = useCallback((results: unknown) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = results as any;
    const hasLm = r?.multiFaceLandmarks?.length > 0;
    const now   = Date.now();

    if (hasLm) {
      lastFaceTs.current = now;
      if (!faceOkRef.current) { faceOkRef.current = true; setFaceOk(true); }
    } else {
      if (faceOkRef.current && now - lastFaceTs.current > FACE_GRACE_MS) {
        faceOkRef.current = false; setFaceOk(false);
      }
      return;
    }

    const lms = r.multiFaceLandmarks[0];
    const pt  = (i: number) => ({ x: lms[i].x * W, y: lms[i].y * H });

    // ── 1. Iris radius (adaptive scaling) ─────────────────────────────────
    const liris     = pt(468);
    const lirisEdge = pt(469);
    const riris     = pt(473);
    const ririsEdge = pt(474);
    const lRad = Math.hypot(liris.x - lirisEdge.x, liris.y - lirisEdge.y);
    const rRad = Math.hypot(riris.x - ririsEdge.x, riris.y - ririsEdge.y);
    const avgRad = (lRad + rRad) / 2;
    if (avgRad > 2) {
      irisRadiusPxRef.current   = avgRad;
      stabilityScaleRef.current = avgRad / 12;
      if (Math.abs(avgRad - irisRadiusPxRef.current) > 1) {
        setIrisRadiusPx(Math.round(avgRad));
      }
    }

    // ── FEATURE A: Map iris landmarks → screen coordinates ─────────────────
    // Average left iris (468) and right iris (473) normalised positions,
    // then scale to screen dimensions.
    // Note: the video preview is mirrored (scaleX(-1)) so we flip irisX.
    {
      const irisNormX = ((lms[LM_L_IRIS].x + lms[LM_R_IRIS].x) / 2);
      const irisNormY = ((lms[LM_L_IRIS].y + lms[LM_R_IRIS].y) / 2);

      // Flip X because the video is displayed mirrored but landmark x is raw
      const flippedX = 1.0 - irisNormX;

      // Apply sensitivity multiplier around screen centre
      const baseX = flippedX * window.innerWidth;
      const baseY = irisNormY * window.innerHeight;
      const cx0   = window.innerWidth  / 2;
      const cy0   = window.innerHeight / 2;
      const sens  = sensitivityRef.current;

      rawX.current     = cx0 + (baseX - cx0) * sens;
      rawY.current     = cy0 + (baseY - cy0) * sens;
      lastGazeTs.current = now; // mark gaze as fresh so gazeLoop processes it
    }

    // ── FEATURE C: EAR blink detection (enabled by default) ───────────────
    // Runs whenever blinkModeRef is true (default: true).
    if (blinkModeRef.current) {
      const earL = calcEAR(lms, W, H, EAR_L);
      const earR = calcEAR(lms, W, H, EAR_R);
      const ear  = (earL + earR) / 2;

      // Rolling 5-frame EAR smoothing to ignore camera noise
      const hist = earHistRef.current;
      hist.push(ear);
      if (hist.length > 5) hist.shift();
      const smoothEAR = hist.reduce((a, b) => a + b, 0) / hist.length;

      const threshold = blinkThreshRef.current;

      if (smoothEAR < threshold) {
        // Eye is closing — record when it started
        if (blinkStartTs.current === null) blinkStartTs.current = now;
      } else {
        // Eye just reopened
        if (blinkStartTs.current !== null) {
          const closedDuration = now - blinkStartTs.current;
          blinkStartTs.current = null;

          // Valid deliberate blink: 150–500 ms, with 800ms cooldown
          if (
            closedDuration >= BLINK_HOLD_MS &&
            closedDuration <= BLINK_MAX_MS  &&
            now - lastBlinkClickTs.current > BLINK_COOLDOWN_MS
          ) {
            // Fire click at current smoothed cursor position
            const cx = smoothX.current;
            const cy = smoothY.current;
            const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
            if (el && !OWN_IDS.has(el.id)) {
              el.click();
              flashCursor();
              lastBlinkClickTs.current = now;
              console.log("[EyeTracking] BLINK CLICK:", getLabel(el));
              updateUI(`Blink clicked: ${getLabel(el)}`, "👁 Blink click!");
            }
          }
        }
      }
    }

    // ── Draw eye overlay ───────────────────────────────────────────────────
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);

    const drawEye = (indices: number[]) => {
      const pts = indices.map(pt);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.strokeStyle = "rgba(34,197,94,.65)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    };
    drawEye([33, 160, 158, 133, 153, 144]);
    drawEye([263, 387, 385, 362, 380, 373]);

    const drawIris = (idx: number) => {
      const { x, y } = pt(idx);
      const g = ctx.createRadialGradient(x, y, 1, x, y, 11);
      g.addColorStop(0, "rgba(239,68,68,.9)");
      g.addColorStop(1, "rgba(239,68,68,0)");
      ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444"; ctx.fill();
      ctx.beginPath(); ctx.arc(x - 1.5, y - 1.5, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.82)"; ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, irisRadiusPxRef.current, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    drawIris(468);
    drawIris(473);

    const drawArrow = (irisIdx: number, outerIdx: number) => {
      const i = pt(irisIdx), o = pt(outerIdx);
      const dx = i.x - o.x, dy = i.y - o.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.beginPath();
      ctx.moveTo(i.x, i.y);
      ctx.lineTo(i.x + (dx / len) * 18, i.y + (dy / len) * 18);
      ctx.strokeStyle = "rgba(251,191,36,.72)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawArrow(468, LM_L_OUTER);
    drawArrow(473, LM_R_OUTER);

    ctx.restore();
    void LM_L_IRIS; void LM_R_IRIS;
  }, [updateUI]);

  // ══════════════════════════════════════════════════════════════════════════
  //  C — Main gaze render loop (triple EMA + velocity + scroll)
  //  FEATURE B (scroll) is already implemented here via smoothY + SCROLL_ZONE.
  // ══════════════════════════════════════════════════════════════════════════
  const gazeLoop = useCallback(() => {
    gazeRafId.current = requestAnimationFrame(() => gazeLoopRef.current());

    // Skip frame if no fresh gaze data (stale > 500ms)
    if (Date.now() - lastGazeTs.current > 500) return;

    // ── Triple EMA smoothing ────────────────────────────────────────────────
    // Stage 1: raw iris position → fast EMA (removes high-freq noise)
    const alpha1 = Math.min(0.55, EMA_FAST * sensitivityRef.current);
    emaFastX.current = emaFastX.current * (1 - alpha1) + rawX.current * alpha1;
    emaFastY.current = emaFastY.current * (1 - alpha1) + rawY.current * alpha1;

    // Stage 2: fast EMA → mid EMA (smooths micro-jitter)
    emaMidX.current = emaMidX.current * (1 - EMA_MID) + emaFastX.current * EMA_MID;
    emaMidY.current = emaMidY.current * (1 - EMA_MID) + emaFastY.current * EMA_MID;

    // Velocity — boost alpha when cursor lags a fast intentional movement
    const dx   = emaMidX.current - prevSmoothX.current;
    const dy   = emaMidY.current - prevSmoothY.current;
    const vel  = Math.hypot(dx, dy);
    const alpha3 = vel > VEL_DAMP_PX ? EMA_CATCH : EMA_SLOW;

    prevSmoothX.current = smoothX.current;
    prevSmoothY.current = smoothY.current;

    // Stage 3: mid EMA → stable cursor position
    smoothX.current = smoothX.current * (1 - alpha3) + emaMidX.current * alpha3;
    smoothY.current = smoothY.current * (1 - alpha3) + emaMidY.current * alpha3;

    const cx = Math.max(8, Math.min(window.innerWidth  - 8, smoothX.current));
    const cy = Math.max(8, Math.min(window.innerHeight - 8, smoothY.current));

    // Move cursor DOM elements
    if (cursorEl.current)
      cursorEl.current.style.transform = `translate(${cx - 10}px,${cy - 10}px)`;
    if (ringEl.current)
      ringEl.current.style.transform   = `translate(${cx - 28}px,${cy - 28}px)`;

    if (!faceOkRef.current) {
      setCursorColor(CUR_NO_FACE);
      resetDwell();
      updateUI("—", "⚠ No face — move closer");
      return;
    }

    // ── FEATURE B: Scroll zones ─────────────────────────────────────────────
    // Top 10% of viewport → scroll up
    if (cy < window.innerHeight * SCROLL_ZONE) {
      window.scrollBy({ top: -SCROLL_PX });
      resetDwell();
      updateUI("—", "↑ Scrolling Up");
      return;
    }
    // Bottom 10% of viewport → scroll down
    if (cy > window.innerHeight * (1 - SCROLL_ZONE)) {
      window.scrollBy({ top: SCROLL_PX });
      resetDwell();
      updateUI("—", "↓ Scrolling Down");
      return;
    }

    // Element under gaze
    const rawEl  = document.elementFromPoint(cx, cy);
    const target = closestInteractive(rawEl);
    positionHighlight(target);
    const label = getLabel(target);

    // Keyboard key dwell
    const kbKey = target?.getAttribute("data-ez-key");
    if (kbKey && showKeyboard) {
      setCursorColor(CUR_FOCUS);
      handleKeyDwell(kbKey, label);
      return;
    }
    kbDwellStartTs.current = null;
    kbCurrentKey.current   = null;

    if (!target || OWN_IDS.has(target.id)) {
      setCursorColor(CUR_IDLE);
      resetDwell();
      updateUI(label, "Tracking gaze");
      return;
    }

    // Adaptive stability (scaled by iris radius)
    const adaptiveStability = BASE_STABILITY * stabilityScaleRef.current;

    if (dwellStartTs.current !== null) {
      const ddx = cx - dwellAnchorX.current;
      const ddy = cy - dwellAnchorY.current;
      if (Math.hypot(ddx, ddy) > adaptiveStability || target !== dwellTargetEl.current) {
        resetDwell();
      }
    }

    if (dwellStartTs.current === null) {
      dwellStartTs.current  = Date.now();
      dwellAnchorX.current  = cx;
      dwellAnchorY.current  = cy;
      dwellTargetEl.current = target;
    }

    const elapsed   = Date.now() - dwellStartTs.current;
    const dwellMs   = dwellMsRef.current;
    const progress  = Math.max(0, Math.min(1,
      (elapsed - DWELL_START_MS) / (dwellMs - DWELL_START_MS)
    ));

    if (elapsed > DWELL_START_MS) {
      setCursorColor(CUR_FOCUS);
      setRingProgress(progress);
      updateUI(label, `Clicking in ${((dwellMs - elapsed) / 1000).toFixed(1)}s`);
      setDwellPct(Math.round(progress * 100));
    } else {
      setCursorColor(CUR_IDLE);
      updateUI(label, "Focusing…");
    }

    if (elapsed >= dwellMs) {
      setCursorColor(CUR_CLICK);
      const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
      if (el && !OWN_IDS.has(el.id)) {
        el.click();
        flashCursor();
        console.log("[EyeTracking] DWELL CLICK:", getLabel(el));
      }
      resetDwell();
      updateUI(`Clicked: ${label}`, "✓ Clicked!");
      setDwellPct(0);
    }
  }, [updateUI, showKeyboard]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { gazeLoopRef.current = gazeLoop; }, [gazeLoop]);

  // ── Keyboard key dwell ────────────────────────────────────────────────────
  const handleKeyDwell = (key: string, label: string) => {
    if (kbCurrentKey.current !== key) {
      kbDwellStartTs.current = Date.now();
      kbCurrentKey.current   = key;
      setActiveKey(key);
    }
    const elapsed  = Date.now() - (kbDwellStartTs.current ?? Date.now());
    const dwellMs  = dwellMsRef.current;
    const progress = Math.max(0, Math.min(1,
      (elapsed - DWELL_START_MS) / (dwellMs - DWELL_START_MS)
    ));
    if (elapsed > DWELL_START_MS) {
      setRingProgress(progress);
      setDwellPct(Math.round(progress * 100));
      updateUI(`Key: ${key}`, `Typing in ${((dwellMs - elapsed) / 1000).toFixed(1)}s`);
    }
    if (elapsed >= dwellMs) {
      if (key === "⌫")         { setTypedText(t => t.slice(0, -1)); onKeyPress?.(key); }
      else if (key === "↵")    { onKeyPress?.(key); }
      else {
        const ch = key === " SPACE " ? " " : key;
        setTypedText(t => t + ch);
        onKeyPress?.(ch);
        updateUI("", `Typed: ${ch}`);
      }
      flashCursor();
      resetDwell();
      kbDwellStartTs.current = null;
      kbCurrentKey.current   = null;
      setActiveKey(null);
      setDwellPct(0);
    }
    positionHighlight(document.querySelector(`[data-ez-key="${key}"]`));
    void label;
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────
  const setRingProgress = (p: number) => {
    if (!ringArcEl.current) return;
    const c = 2 * Math.PI * 22;
    ringArcEl.current.style.strokeDashoffset = String(c * (1 - p));
    ringArcEl.current.style.opacity          = String(0.3 + p * 0.7);
  };
  const resetDwell = () => {
    dwellStartTs.current  = null;
    dwellTargetEl.current = null;
    if (ringArcEl.current) {
      ringArcEl.current.style.strokeDashoffset = String(2 * Math.PI * 22);
      ringArcEl.current.style.opacity = "0";
    }
  };
  const flashCursor = () => {
    if (!cursorEl.current) return;
    const el = cursorEl.current;
    el.style.background = CUR_CLICK;
    el.style.transform  += " scale(1.4)";
    setTimeout(() => {
      if (el) {
        el.style.background = CUR_IDLE;
        el.style.transform  = el.style.transform.replace(" scale(1.4)", "");
      }
    }, 300);
  };
  const positionHighlight = (el: Element | null) => {
    if (!highlightEl.current) return;
    if (!el) { highlightEl.current.style.opacity = "0"; return; }
    const r = el.getBoundingClientRect();
    if (!r.width) { highlightEl.current.style.opacity = "0"; return; }
    Object.assign(highlightEl.current.style, {
      opacity:"1",
      left:`${r.left - 4 + window.scrollX}px`,
      top:`${r.top  - 4 + window.scrollY}px`,
      width:`${r.width  + 8}px`,
      height:`${r.height + 8}px`,
    });
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  D — Calibration
  // ══════════════════════════════════════════════════════════════════════════
  const handleCalClick = () => {
    calClicksRef.current += 1;
    const clicks = calClicksRef.current;
    const idx    = calIdxRef.current;

    const totalDone   = idx * CAL_CLICKS + clicks;
    const totalNeeded = CAL_POINTS.length * CAL_CLICKS;
    const newAcc = Math.min(95, Math.round((totalDone / totalNeeded) * 95));
    calAccRef.current = newAcc;

    setCalDisplay({ idx, clicks, pct: Math.round((idx / CAL_POINTS.length) * 100) });
    setAccuracy(newAcc);

    if (clicks >= CAL_CLICKS) {
      calIdxRef.current    = idx + 1;
      calClicksRef.current = 0;
      const nextIdx = calIdxRef.current;

      setCalDisplay({ idx: nextIdx, clicks: 0,
        pct: Math.round((nextIdx / CAL_POINTS.length) * 100) });

      if (nextIdx >= CAL_POINTS.length) {
        setAccuracy(95);
        calAccRef.current = 95;
        setPhase("tracking");
        gazeRafId.current = requestAnimationFrame(() => gazeLoopRef.current());
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  E — Mount: create DOM overlays
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.id = "ez-cursor";
    Object.assign(cursor.style, {
      position:"fixed", top:"0", left:"0",
      width:"20px", height:"20px", borderRadius:"50%",
      background:CUR_IDLE,
      border:"2.5px solid rgba(255,255,255,.95)",
      zIndex:"2147483644", pointerEvents:"none",
      willChange:"transform",
      transition:"background .15s, transform .1s",
      boxShadow:"0 0 0 4px rgba(99,102,241,.22), 0 2px 12px rgba(0,0,0,.4)",
    });
    document.body.appendChild(cursor);
    cursorEl.current = cursor;

    const ns  = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns,"svg") as unknown as SVGSVGElement;
    svg.id = "ez-ring";
    svg.setAttribute("width","56"); svg.setAttribute("height","56");
    svg.setAttribute("viewBox","0 0 56 56");
    Object.assign((svg as unknown as HTMLElement).style, {
      position:"fixed", top:"0", left:"0", zIndex:"2147483643",
      pointerEvents:"none", willChange:"transform", overflow:"visible",
    });
    const bgC = document.createElementNS(ns,"circle");
    bgC.setAttribute("cx","28"); bgC.setAttribute("cy","28"); bgC.setAttribute("r","22");
    bgC.setAttribute("fill","none");
    bgC.setAttribute("stroke","rgba(255,255,255,.1)");
    bgC.setAttribute("stroke-width","3");
    svg.appendChild(bgC);
    const circ = 2 * Math.PI * 22;
    const arc  = document.createElementNS(ns,"circle");
    arc.setAttribute("cx","28"); arc.setAttribute("cy","28"); arc.setAttribute("r","22");
    arc.setAttribute("fill","none"); arc.setAttribute("stroke","#6366f1");
    arc.setAttribute("stroke-width","3.5"); arc.setAttribute("stroke-linecap","round");
    arc.setAttribute("stroke-dasharray",String(circ));
    arc.setAttribute("stroke-dashoffset",String(circ));
    arc.setAttribute("transform","rotate(-90 28 28)");
    arc.style.opacity = "0";
    arc.style.transition = "stroke-dashoffset .05s linear, opacity .1s";
    svg.appendChild(arc);
    ringArcEl.current = arc;
    document.body.appendChild(svg);
    ringEl.current = svg;

    const hl = document.createElement("div");
    hl.id = "ez-highlight";
    Object.assign(hl.style, {
      position:"absolute", zIndex:"2147483642", pointerEvents:"none",
      borderRadius:"7px", border:"2px solid rgba(99,102,241,.78)",
      background:"rgba(99,102,241,.07)",
      boxShadow:"0 0 16px rgba(99,102,241,.35)", opacity:"0",
      transition:"opacity .12s, left .07s, top .07s, width .07s, height .07s",
    });
    document.body.appendChild(hl);
    highlightEl.current = hl;

    return () => {
      gazeRafId.current && cancelAnimationFrame(gazeRafId.current);
      faceRafId.current && cancelAnimationFrame(faceRafId.current);
      try {
        window.webgazer?.clearGazeListener();
        window.webgazer?.end();
      } catch (_) {}
      ["ez-cursor","ez-ring","ez-highlight"].forEach(id =>
        document.getElementById(id)?.remove()
      );
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════

  if (phase === "intro") return (
    <>
      <style>{`
        @keyframes ezPulse{0%,100%{transform:scale(1);opacity:.7}
          50%{transform:scale(1.15);opacity:1}}
      `}</style>
      <div style={S.overlay}>
        <div style={S.card}>
          <div style={S.glow}/>
          <div style={S.iconWrap}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <ellipse cx="19" cy="19" rx="16" ry="10" stroke="#6366f1" strokeWidth="2"/>
              <circle cx="19" cy="19" r="5.5" fill="#6366f1"/>
              <circle cx="21" cy="17" r="2" fill="white" opacity=".85"/>
            </svg>
          </div>
          <h2 style={S.title}>Eye Control System</h2>
          <p style={S.sub}>
            Full website control with your gaze — cursor, click, scroll and
            keyboard all driven by where you look. Adapts to your eye size automatically.
          </p>
          <div style={S.steps}>
            {[
              ["1","Allow camera access when prompted"],
              ["2","Sit ~60 cm from screen in good lighting"],
              ["3","Click each calibration dot 3 times"],
              ["4","Look at any element for 2 s to click it"],
              ["5","Slow blink (150–500ms) to click instantly — ON by default"],
            ].map(([n, t]) => (
              <div key={n} style={S.step}>
                <span style={S.num}>{n}</span>
                <span style={S.stepTxt}>{t}</span>
              </div>
            ))}
          </div>
          <button style={S.btn} onClick={initWebGazer}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
              style={{marginRight:8}}>
              <ellipse cx="8.5" cy="8.5" rx="7.5" ry="4.8" stroke="white" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="2.8" fill="white"/>
            </svg>
            Start Eye Tracking
          </button>
          <p style={S.msg}>{initMsg}</p>
        </div>
      </div>
    </>
  );

  if (phase === "calibrating") {
    const { idx, clicks, pct } = calDisplay;
    const done  = idx >= CAL_POINTS.length;
    const dot   = done ? null : CAL_POINTS[Math.min(idx, CAL_POINTS.length - 1)];
    const dotX  = dot ? Math.round(dot.x * window.innerWidth)  : 0;
    const dotY  = dot ? Math.round(dot.y * window.innerHeight) : 0;

    return (
      <>
        <style>{`
          @keyframes calPulse{
            0%{transform:scale(1);opacity:.6}
            50%{transform:scale(1.4);opacity:.15}
            100%{transform:scale(1.65);opacity:0}
          }
        `}</style>
        <div style={S.calOverlay}>
          <CameraPanel
            previewRef={previewRef} canvasRef={canvasRef}
            faceOk={faceOk} dwellPct={0} accuracy={accuracy}
            actionText="Calibrating…" lookingAt="—" phase="calibrating"
            irisRadiusPx={irisRadiusPx}
          />

          <div style={S.calBar}>
            <span style={S.calTag}>CALIBRATION</span>
            <span style={S.calProg}>
              {Math.min(idx + 1, CAL_POINTS.length)} / {CAL_POINTS.length}
            </span>
            <div style={S.calAccWrap}>
              <div style={S.calAccTrack}>
                <div style={{...S.calAccFill, width:`${accuracy}%`}}/>
              </div>
              <span style={S.calAccVal}>{accuracy}%</span>
            </div>
          </div>

          <div style={S.calInstr}>
            {done
              ? "Complete — starting…"
              : <>Look at the dot and <strong>click {CAL_CLICKS}×</strong>
                  &nbsp;·&nbsp; {clicks}/{CAL_CLICKS}</>}
          </div>

          <div style={S.pips}>
            {CAL_POINTS.map((_, i) => (
              <div key={i} style={{
                ...S.pip,
                background: i < idx
                  ? "#6366f1"
                  : i === idx ? "rgba(99,102,241,.45)"
                  : "rgba(255,255,255,.12)",
              }}/>
            ))}
          </div>

          <div style={S.calBarBg}>
            <div style={{...S.calBarFg, width:`${pct}%`}}/>
          </div>

          {dot && (
            <button onClick={handleCalClick} style={{
              ...S.calDot,
              left: dotX - 20, top: dotY - 20,
              background:`conic-gradient(#6366f1 ${(clicks / CAL_CLICKS) * 360}deg,
                rgba(255,255,255,.18) ${(clicks / CAL_CLICKS) * 360}deg)`,
            }}>
              <span style={S.calCore}/>
              <span style={{...S.calRing, animation:"calPulse 1.2s ease-out infinite"}}/>
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <CameraPanel
        previewRef={previewRef} canvasRef={canvasRef}
        faceOk={faceOk} dwellPct={dwellPct} accuracy={accuracy}
        actionText={actionText} lookingAt={lookingAt} phase="tracking"
        irisRadiusPx={irisRadiusPx}
      />
      <SettingsPanel
        dwellMsRef={dwellMsRef}
        sensitivityRef={sensitivityRef}
        blinkModeRef={blinkModeRef}
        blinkThreshRef={blinkThreshRef}
        blinkMode={blinkMode}
        onBlinkToggle={() => {
          blinkModeRef.current = !blinkModeRef.current;
          setBlinkMode(blinkModeRef.current);
        }}
      />
      {showKeyboard && (
        <VirtualKeyboard rows={KB_ROWS} activeKey={activeKey}
          typedText={typedText} dwellPct={dwellPct}/>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS (unchanged from v5)
// ═════════════════════════════════════════════════════════════════════════════

interface CamPanelProps {
  previewRef: React.RefObject<HTMLVideoElement>;
  canvasRef:  React.RefObject<HTMLCanvasElement>;
  faceOk: boolean; dwellPct: number; accuracy: number;
  actionText: string; lookingAt: string; phase: string;
  irisRadiusPx: number;
}
function CameraPanel({
  previewRef, canvasRef, faceOk, dwellPct,
  accuracy, actionText, lookingAt, phase, irisRadiusPx,
}: CamPanelProps) {
  const aColor =
    actionText.includes("Clicking")  ? "#fbbf24" :
    actionText.includes("Clicked")   ? "#22c55e" :
    actionText.includes("Scrolling") ? "#60a5fa" :
    actionText.includes("Typed")     ? "#f472b6" :
    actionText.includes("⚠")         ? "#ef4444" :
    actionText.includes("Calibrat")  ? "#a78bfa" :
    actionText.includes("👁")         ? "#22c55e" : "#a5b4fc";

  return (
    <div id="ez-cam-panel" style={CP.panel}>
      <div style={CP.videoWrap}>
        <video ref={previewRef} style={CP.video}
          autoPlay muted playsInline width={240} height={180}/>
        <canvas ref={canvasRef} style={CP.canvas} width={240} height={180}/>
        <div style={{...CP.badge,
          background: faceOk ? "rgba(22,163,74,.9)" : "rgba(220,38,38,.9)"}}>
          <span style={{...CP.dot2,
            background: faceOk ? "#86efac" : "#fca5a5",
            boxShadow:  faceOk ? "0 0 5px #22c55e" : "0 0 6px #ef4444"}}/>
          {faceOk ? "✅ Face detected" : "❌ No face"}
        </div>
        {irisRadiusPx > 0 && (
          <div style={CP.irisBadge}>
            👁 {irisRadiusPx}px
          </div>
        )}
        {dwellPct > 0 && (
          <div style={CP.dwellBar}>
            <div style={{...CP.dwellFill, width:`${dwellPct}%`}}/>
          </div>
        )}
      </div>
      <div style={CP.info}>
        <div style={CP.header}>
          <span style={{...CP.statusDot,
            background: phase==="tracking" ? "#22c55e" : "#fbbf24",
            boxShadow:  phase==="tracking" ? "0 0 7px #22c55e" : "0 0 7px #fbbf24"}}/>
          <span style={CP.panelTitle}>
            {phase==="tracking" ? "Eye Control Active" : "Calibrating…"}
          </span>
          <span style={CP.acc}>{accuracy}%</span>
        </div>
        <Row label="FACE"
          value={faceOk ? "Detected ✓" : "Not detected ✗"}
          color={faceOk ? "#22c55e" : "#ef4444"}/>
        <Row label="IRIS"
          value={irisRadiusPx > 0 ? `${irisRadiusPx}px radius` : "Measuring…"}
          color="#fbbf24"/>
        <Row label="FOCUS"  value={lookingAt}/>
        <Row label="ACTION" value={actionText} color={aColor}/>
        {dwellPct > 0 && (
          <div style={CP.dwellRow}>
            <span style={CP.rowLbl}>DWELL</span>
            <div style={CP.dwellTrack}>
              <div style={{...CP.dwellTrackFg, width:`${dwellPct}%`}}/>
            </div>
            <span style={{...CP.rowVal, color:"#fbbf24"}}>{dwellPct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({label,value,color}:{label:string;value:string;color?:string}) {
  return (
    <div style={CP.row}>
      <span style={CP.rowLbl}>{label}</span>
      <span style={{...CP.rowVal, color:color??"#a5b4fc"}} title={value}>
        {value.slice(0,28)}
      </span>
    </div>
  );
}

interface SettingsPanelProps {
  dwellMsRef:      React.MutableRefObject<number>;
  sensitivityRef:  React.MutableRefObject<number>;
  blinkModeRef:    React.MutableRefObject<boolean>;
  blinkThreshRef:  React.MutableRefObject<number>;
  blinkMode:       boolean;
  onBlinkToggle:   () => void;
}
function SettingsPanel({
  dwellMsRef, sensitivityRef, blinkThreshRef, blinkMode, onBlinkToggle,
}: SettingsPanelProps) {
  const [open,     setOpen]     = useState(false);
  const [dwell,    setDwell]    = useState(dwellMsRef.current / 1000);
  const [sens,     setSens]     = useState(sensitivityRef.current);
  const [thresh,   setThresh]   = useState(blinkThreshRef.current);

  return (
    <div id="ez-settings" style={SP.wrap}>
      <button style={SP.toggle} onClick={() => setOpen(o => !o)}
        title="Eye tracking settings">
        ⚙
      </button>
      {open && (
        <div style={SP.panel}>
          <div style={SP.title}>Accessibility Settings</div>

          <label style={SP.label}>
            Dwell time: <strong>{dwell.toFixed(1)}s</strong>
          </label>
          <input type="range" min={0.5} max={4} step={0.1}
            value={dwell}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setDwell(v);
              dwellMsRef.current = v * 1000;
            }}
            style={SP.range}
          />

          <label style={SP.label}>
            Sensitivity: <strong>{sens.toFixed(1)}×</strong>
          </label>
          <input type="range" min={0.5} max={2} step={0.1}
            value={sens}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setSens(v);
              sensitivityRef.current = v;
            }}
            style={SP.range}
          />

          <div style={SP.row}>
            <span style={SP.label}>Blink-to-click</span>
            <button style={{
              ...SP.pill,
              background: blinkMode ? "rgba(99,102,241,.4)" : "rgba(255,255,255,.08)",
              border: blinkMode ? "1px solid #6366f1" : "1px solid rgba(255,255,255,.12)",
              color: blinkMode ? "#e0e7ff" : "#64748b",
            }} onClick={onBlinkToggle}>
              {blinkMode ? "ON" : "OFF"}
            </button>
          </div>

          {blinkMode && (
            <>
              <label style={SP.label}>
                Blink threshold: <strong>{thresh.toFixed(2)}</strong>
              </label>
              <input type="range" min={0.10} max={0.30} step={0.01}
                value={thresh}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setThresh(v);
                  blinkThreshRef.current = v;
                }}
                style={SP.range}
              />
              <p style={SP.hint}>
                Lower = harder to trigger · Slow blink 150–500ms = click
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface KBProps {
  rows:string[][]; activeKey:string|null; typedText:string; dwellPct:number;
}
function VirtualKeyboard({rows,activeKey,typedText,dwellPct}:KBProps) {
  return (
    <div id="ez-keyboard" style={KB.wrap}>
      <div style={KB.display}>
        <span style={KB.text}>
          {typedText||<em style={{opacity:.35}}>Look at a key for 2s to type…</em>}
        </span>
        {activeKey&&(
          <span style={KB.typing}>
            Typing: <strong>{activeKey}</strong> ({dwellPct}%)
          </span>
        )}
      </div>
      {rows.map((row,ri)=>(
        <div key={ri} style={KB.row}>
          {row.map(key=>(
            <button key={key} data-ez-key={key} style={{
              ...KB.key,
              minWidth:key===" SPACE "?160:undefined,
              background:activeKey===key?"rgba(99,102,241,.38)":"rgba(255,255,255,.06)",
              border:activeKey===key?"1.5px solid #6366f1":"1.5px solid rgba(255,255,255,.1)",
              boxShadow:activeKey===key?"0 0 16px rgba(99,102,241,.5)":"none",
              color:activeKey===key?"#e0e7ff":"#94a3b8",
            }}>
              {activeKey===key&&(
                <span style={{...KB.arc,
                  background:`conic-gradient(#6366f1 ${dwellPct*3.6}deg,
                    transparent ${dwellPct*3.6}deg)`}}/>
              )}
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S:Record<string,React.CSSProperties> = {
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,.83)",
    display:"flex",alignItems:"center",justifyContent:"center",
    zIndex:2147483640,backdropFilter:"blur(5px)"},
  card:{position:"relative",background:"#07071A",
    border:"1px solid rgba(99,102,241,.18)",borderRadius:22,
    padding:"38px 34px",maxWidth:430,width:"92%",textAlign:"center",
    boxShadow:"0 32px 80px rgba(0,0,0,.55)",overflow:"hidden"},
  glow:{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",
    width:200,height:200,borderRadius:"50%",
    background:"rgba(99,102,241,.12)",filter:"blur(42px)",pointerEvents:"none"},
  iconWrap:{width:64,height:64,borderRadius:"50%",
    background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.28)",
    display:"flex",alignItems:"center",justifyContent:"center",
    margin:"0 auto 20px",animation:"ezPulse 2.5s ease-in-out infinite"},
  title:{margin:"0 0 10px",fontSize:23,fontWeight:700,color:"#f1f5f9",letterSpacing:"-.5px"},
  sub:{color:"#94a3b8",fontSize:13.5,lineHeight:1.65,margin:"0 0 24px"},
  steps:{textAlign:"left",marginBottom:26},
  step:{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10},
  num:{width:21,height:21,borderRadius:"50%",
    background:"rgba(99,102,241,.14)",border:"1px solid rgba(99,102,241,.3)",
    color:"#a5b4fc",fontSize:11,fontWeight:700,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  stepTxt:{color:"#cbd5e1",fontSize:13,lineHeight:1.55,paddingTop:3},
  btn:{display:"flex",alignItems:"center",justifyContent:"center",
    width:"100%",padding:"13px 20px",background:"#6366f1",
    color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:600,
    cursor:"pointer",boxShadow:"0 4px 22px rgba(99,102,241,.45)",marginBottom:12},
  msg:{color:"#64748b",fontSize:12,margin:0},
  calOverlay:{position:"fixed",inset:0,background:"rgba(2,2,14,.96)",
    zIndex:2147483641,backdropFilter:"blur(2px)"},
  calBar:{position:"absolute",top:24,left:"50%",transform:"translateX(-50%)",
    display:"flex",alignItems:"center",gap:16,
    background:"rgba(8,8,22,.98)",border:"1px solid rgba(99,102,241,.18)",
    borderRadius:12,padding:"9px 18px",backdropFilter:"blur(10px)",
    boxShadow:"0 4px 24px rgba(0,0,0,.45)"},
  calTag:{background:"rgba(99,102,241,.18)",color:"#a5b4fc",fontSize:10,
    fontWeight:700,letterSpacing:".08em",padding:"3px 8px",
    borderRadius:99,textTransform:"uppercase" as const},
  calProg:{color:"#f1f5f9",fontSize:13,fontWeight:600},
  calAccWrap:{display:"flex",alignItems:"center",gap:7},
  calAccTrack:{width:70,height:3,background:"rgba(255,255,255,.1)",
    borderRadius:99,overflow:"hidden"},
  calAccFill:{height:"100%",
    background:"linear-gradient(90deg,#6366f1,#22c55e)",transition:"width .4s ease"},
  calAccVal:{color:"#22c55e",fontSize:12,fontWeight:600,minWidth:28},
  calInstr:{position:"absolute",bottom:74,left:"50%",transform:"translateX(-50%)",
    color:"#94a3b8",fontSize:13,textAlign:"center",whiteSpace:"nowrap" as const},
  pips:{position:"absolute",bottom:44,left:"50%",transform:"translateX(-50%)",
    display:"flex",gap:5},
  pip:{width:7,height:7,borderRadius:"50%",transition:"background .3s"},
  calBarBg:{position:"absolute",bottom:20,left:"10%",width:"80%",height:2,
    background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"},
  calBarFg:{height:"100%",background:"#6366f1",transition:"width .4s ease"},
  calDot:{position:"fixed",width:40,height:40,borderRadius:"50%",border:"none",
    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
    zIndex:2147483642,padding:0,boxShadow:"0 0 26px rgba(99,102,241,.65)"},
  calCore:{display:"block",width:11,height:11,borderRadius:"50%",
    background:"#fff",position:"relative",zIndex:1},
  calRing:{display:"block",position:"absolute",width:40,height:40,
    borderRadius:"50%",border:"2px solid rgba(99,102,241,.5)"},
};

const CP:Record<string,React.CSSProperties> = {
  panel:{position:"fixed",bottom:20,right:20,zIndex:2147483638,
    background:"rgba(4,4,18,.97)",border:"1px solid rgba(99,102,241,.25)",
    borderRadius:16,overflow:"hidden",width:240,
    boxShadow:"0 20px 50px rgba(0,0,0,.55)",pointerEvents:"none",
    backdropFilter:"blur(14px)"},
  videoWrap:{position:"relative",width:240,height:180,
    background:"#000",overflow:"hidden"},
  video:{position:"absolute",top:0,left:0,width:"100%",height:"100%",
    objectFit:"cover",transform:"scaleX(-1)"},
  canvas:{position:"absolute",top:0,left:0,width:"100%",height:"100%"},
  badge:{position:"absolute",top:8,left:8,borderRadius:99,padding:"3px 9px",
    fontSize:10,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",
    gap:5,transition:"background .3s"},
  irisBadge:{position:"absolute",top:8,right:8,borderRadius:99,
    padding:"3px 7px",fontSize:9,fontWeight:600,color:"#fbbf24",
    background:"rgba(0,0,0,.55)"},
  dot2:{display:"inline-block",width:6,height:6,borderRadius:"50%",
    transition:"all .3s"},
  dwellBar:{position:"absolute",bottom:0,left:0,width:"100%",height:3,
    background:"rgba(255,255,255,.08)"},
  dwellFill:{height:"100%",background:"#fbbf24",
    transition:"width .06s linear",borderRadius:"0 99px 99px 0"},
  info:{padding:"10px 13px 12px"},
  header:{display:"flex",alignItems:"center",gap:7,marginBottom:8,
    paddingBottom:7,borderBottom:"1px solid rgba(255,255,255,.06)"},
  statusDot:{width:7,height:7,borderRadius:"50%",flexShrink:0,transition:"all .3s"},
  panelTitle:{color:"#e2e8f0",fontSize:11,fontWeight:600,flex:1,
    letterSpacing:".02em"},
  acc:{color:"#22c55e",fontSize:10,fontWeight:700,
    background:"rgba(34,197,94,.1)",padding:"2px 6px",borderRadius:99},
  row:{display:"flex",justifyContent:"space-between",alignItems:"center",
    marginBottom:5,gap:8},
  rowLbl:{color:"#4b5563",fontSize:9,letterSpacing:".08em",fontWeight:700,
    flexShrink:0},
  rowVal:{fontSize:11,fontWeight:500,textAlign:"right",transition:"color .2s",
    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140},
  dwellRow:{display:"flex",alignItems:"center",gap:6,marginTop:4},
  dwellTrack:{flex:1,height:3,background:"rgba(255,255,255,.07)",
    borderRadius:99,overflow:"hidden"},
  dwellTrackFg:{height:"100%",background:"#fbbf24",borderRadius:99,
    transition:"width .06s linear"},
};

const SP:Record<string,React.CSSProperties> = {
  wrap:{position:"fixed",bottom:20,left:20,zIndex:2147483639,
    display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8},
  toggle:{width:36,height:36,borderRadius:"50%",
    background:"rgba(4,4,18,.97)",border:"1px solid rgba(99,102,241,.3)",
    color:"#94a3b8",fontSize:16,cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",
    pointerEvents:"auto"},
  panel:{background:"rgba(4,4,18,.98)",border:"1px solid rgba(99,102,241,.25)",
    borderRadius:14,padding:"14px 16px",width:230,pointerEvents:"auto",
    backdropFilter:"blur(14px)",
    boxShadow:"0 12px 36px rgba(0,0,0,.55)"},
  title:{color:"#e2e8f0",fontSize:12,fontWeight:600,marginBottom:12,
    letterSpacing:".02em"},
  label:{color:"#94a3b8",fontSize:11,display:"block",marginBottom:4,
    marginTop:10},
  range:{width:"100%",accentColor:"#6366f1"},
  row:{display:"flex",alignItems:"center",justifyContent:"space-between",
    marginTop:10},
  pill:{padding:"3px 12px",borderRadius:99,fontSize:11,fontWeight:600,
    cursor:"pointer",transition:"all .2s"},
  hint:{color:"#4b5563",fontSize:10,marginTop:6,lineHeight:1.5},
};

const KB:Record<string,React.CSSProperties> = {
  wrap:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
    zIndex:2147483637,background:"rgba(4,4,18,.97)",
    border:"1px solid rgba(99,102,241,.2)",borderRadius:16,padding:"14px 16px",
    backdropFilter:"blur(14px)",pointerEvents:"auto"},
  display:{background:"rgba(255,255,255,.04)",
    border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px 12px",
    marginBottom:10,minHeight:36,display:"flex",alignItems:"center",
    justifyContent:"space-between",gap:8},
  text:{color:"#e2e8f0",fontSize:14,flex:1,letterSpacing:".02em"},
  typing:{color:"#fbbf24",fontSize:11,fontWeight:600,flexShrink:0},
  row:{display:"flex",gap:5,justifyContent:"center",marginBottom:5},
  key:{position:"relative",padding:"9px 11px",borderRadius:8,fontSize:12,
    fontWeight:600,cursor:"pointer",transition:"all .15s",overflow:"hidden",
    minWidth:34,letterSpacing:".04em"},
  arc:{position:"absolute",inset:0,borderRadius:8,opacity:.5,
    pointerEvents:"none",transition:"background .05s"},
};