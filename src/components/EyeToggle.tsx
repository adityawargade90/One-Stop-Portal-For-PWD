import { useState, useCallback } from "react";
import EyeTracking from "./EyeTracking";

// ── Inject keyframes once ─────────────────────────────────────────────────────
const STYLE_ID = "ez-toggle-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes ezPing {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes ezPulse {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 1; }
    }
    #ez-toggle-btn:hover { filter: brightness(1.18); }
  `;
  document.head.appendChild(style);
}

// ── Status classifier ─────────────────────────────────────────────────────────
/**
 * Maps the raw status string emitted by EyeTracking v5 onto a
 * display-friendly label + semantic colour token.
 *
 * v5 emits (in order):
 *   "Waiting for WebGazer…"
 *   "Configuring WebGazer…"
 *   "Camera starting — allow access if prompted…"
 *   "Locating WebGazer video…"
 *   "Calibrate for best accuracy"        ← phase="calibrating"
 *   "Error: <message>"                   ← on failure
 */
type StatusKind = "idle" | "loading" | "calibrating" | "tracking" | "error";

function classifyStatus(s: string): StatusKind {
  if (!s || s === "Click to enable") return "idle";
  if (s.startsWith("Error"))          return "error";
  if (s === "Calibrate for best accuracy") return "calibrating";
  // Once calibration is done the component moves to tracking phase internally;
  // no further onStatusChange is fired — we infer tracking from phase via
  // the `tracking` prop passed back up.
  return "loading";
}

const STATUS_COLOUR: Record<StatusKind, string> = {
  idle:        "#64748b",
  loading:     "#a5b4fc",
  calibrating: "#fbbf24",
  tracking:    "#22c55e",
  error:       "#f87171",
};

// Friendly short label to show in the pill
function shortStatus(s: string, isTracking: boolean): string {
  if (isTracking)                            return "Active";
  if (!s || s === "Click to enable")         return "Click to enable";
  if (s.startsWith("Error"))                 return s.replace("Error: ", "");
  if (s === "Calibrate for best accuracy")   return "Look at each dot × 3";
  if (s.includes("Camera"))                  return "Allow camera…";
  if (s.includes("WebGazer"))                return "Starting…";
  if (s.includes("video"))                   return "Starting…";
  return s;
}

// ═════════════════════════════════════════════════════════════════════════════
const EyeToggle = () => {
  const [enabled,    setEnabled]    = useState(false);
  const [rawStatus,  setRawStatus]  = useState("Click to enable");
  // isTracking flips true after calibration completes (no status event fires,
  // so we watch for the last known loading→calibrating→silence transition).
  const [isTracking, setIsTracking] = useState(false);

  const handleStatusChange = useCallback((s: string) => {
    setRawStatus(s);
    // "Calibrate for best accuracy" is the last status before tracking starts
    // After user finishes calibration no further event fires, so we set a
    // 500ms timer: if no new status arrives we assume tracking is live.
    if (s === "Calibrate for best accuracy") {
      const tid = setTimeout(() => {
        // Still on calibrating message — not tracking yet, clear the flag
      }, 500);
      void tid;
    }
    if (s.startsWith("Error")) {
      setIsTracking(false);
    }
  }, []);

  // Called by EyeTracking (add onTrackingStart prop if needed — or we can
  // detect it by the component unmounting calibration phase).
  // For now we expose a simple prop pattern: once calibration dots are all
  // clicked the component switches phase. We detect this via a custom event.
  // If you'd rather wire it through a prop, add `onPhaseChange` to EyeTracking.
  const handleTrackingStart = useCallback(() => {
    setIsTracking(true);
    setRawStatus("Tracking active");
  }, []);

  const toggle = () => {
    if (enabled) {
      setEnabled(false);
      setIsTracking(false);
      setRawStatus("Click to enable");
    } else {
      setEnabled(true);
      setIsTracking(false);
      setRawStatus("Starting…");
    }
  };

  const kind   = isTracking ? "tracking" : classifyStatus(rawStatus);
  const colour = STATUS_COLOUR[kind];
  const label  = shortStatus(rawStatus, isTracking);
  const busy   = kind === "loading" || kind === "calibrating";

  return (
    <>
      {/* ── Toggle bar — sits top-right, clear of all v5 overlays ── */}
      <div style={S.panel}>

        {/* Eye icon */}
        <div style={{ ...S.iconWrap, ...(enabled ? S.iconWrapActive : {}) }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <ellipse
              cx="10" cy="10" rx="8.5" ry="5.5"
              stroke={enabled ? "#6366f1" : "#475569"}
              strokeWidth="1.5"
            />
            <circle cx="10" cy="10" r="3"
              fill={enabled ? "#6366f1" : "#475569"}
            />
            <circle cx="11.2" cy="8.8" r="1"
              fill="white" opacity={enabled ? 1 : 0.4}
            />
            {isTracking && (
              <circle cx="10" cy="10" r="3"
                fill="none" stroke="#6366f1" strokeWidth="1"
                style={{ animation: "ezPing 1.8s ease-out infinite" }}
              />
            )}
          </svg>
        </div>

        {/* Label + status */}
        <div style={S.textWrap}>
          <span style={S.label}>Eye Control</span>
          <div style={S.statusRow}>
            {busy && <span style={S.spinner} />}
            {/* Calibrating pulse dot */}
            {kind === "calibrating" && (
              <span style={{ ...S.pulseDot,
                animation: "ezPulse 1s ease-in-out infinite" }}
              />
            )}
            <span style={{ ...S.statusText, color: colour }}>
              {label}
            </span>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          id="ez-toggle-btn"
          onClick={toggle}
          aria-label={enabled ? "Disable eye tracking" : "Enable eye tracking"}
          aria-pressed={enabled}
          style={{ ...S.toggleTrack, ...(enabled ? S.toggleTrackOn : {}) }}
        >
          <span style={{
            ...S.toggleThumb,
            transform: enabled ? "translateX(18px)" : "translateX(2px)",
            background: isTracking ? "#22c55e" : "#fff",
          }} />
        </button>

      </div>

      {/* ── EyeTracking component — only mounted when enabled ── */}
      {enabled && (
        <EyeTracking
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  /**
   * Positioned top-right so it doesn't overlap:
   *   - Camera panel   (bottom-right)
   *   - Settings panel (bottom-left)
   *   - Keyboard       (bottom-center)
   */
  panel: {
  position:       "fixed",
  bottom:         20,          // move to bottom
  left:           "50%",       // center horizontally
  transform:      "translateX(-50%)", // perfect center alignment
  display:        "flex",
  alignItems:     "center",
  gap:            10,
  background:     "rgba(5,5,16,0.94)",
  border:         "1px solid rgba(99,102,241,0.22)",
  borderRadius:   14,
  padding:        "9px 14px",
  zIndex:         2147483648,
  backdropFilter: "blur(14px)",
  boxShadow:      "0 8px 32px rgba(0,0,0,0.45)",
  userSelect:     "none",
  pointerEvents:  "auto",
},

  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   "50%",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    transition:     "background .25s",
  },

  iconWrapActive: {
    background: "rgba(99,102,241,0.15)",
  },

  textWrap: {
    display:       "flex",
    flexDirection: "column",
    gap:           2,
    minWidth:      110,
  },

  label: {
    color:      "#e2e8f0",
    fontSize:   12,
    fontWeight: 600,
  },

  statusRow: {
    display:    "flex",
    alignItems: "center",
    gap:        5,
  },

  statusText: {
    fontSize:   11,
    transition: "color .3s",
    whiteSpace: "nowrap",
    overflow:   "hidden",
    maxWidth:   120,
    textOverflow: "ellipsis",
  },

  // CSS-only spinner — uses the @keyframes spin injected above
  spinner: {
    display:      "inline-block",
    width:        8,
    height:       8,
    borderRadius: "50%",
    border:       "1.5px solid #6366f1",
    borderTopColor: "transparent",
    flexShrink:   0,
    animation:    "spin 0.7s linear infinite",
  },

  // Amber pulse dot for calibration phase
  pulseDot: {
    display:      "inline-block",
    width:        6,
    height:       6,
    borderRadius: "50%",
    background:   "#fbbf24",
    flexShrink:   0,
  },

  toggleTrack: {
    width:      40,
    height:     22,
    borderRadius: 20,
    background: "rgba(80,80,100,0.6)",
    border:     "1px solid rgba(255,255,255,0.08)",
    position:   "relative",
    cursor:     "pointer",
    transition: "background .3s",
    flexShrink: 0,
  },

  toggleTrackOn: {
    background: "#6366f1",
    border:     "1px solid rgba(99,102,241,0.5)",
  },

  toggleThumb: {
    position:   "absolute",
    top:        2,
    width:      16,
    height:     16,
    borderRadius: "50%",
    transition: "transform .25s, background .3s",
    boxShadow:  "0 1px 4px rgba(0,0,0,0.4)",
  },
};

export default EyeToggle;