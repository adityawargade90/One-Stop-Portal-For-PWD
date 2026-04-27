/**
 * App.tsx — DivyangConnect AI
 *
 * Multimodal accessibility: Eye Tracking + Hand Gestures + Standard input
 *
 * Architecture note:
 *   <HandGestureController> and <EyeToggle> are intentionally placed
 *   OUTSIDE <BrowserRouter>. This means React never unmounts them during
 *   route navigation — the camera stays open, WebGazer keeps tracking,
 *   and MediaPipe keeps its model in memory across all pages.
 *
 *   <AccessibilityPanel> is inside <BrowserRouter> because it likely
 *   uses useNavigate / useLocation from react-router internally.
 */

import { Toaster }                     from "@/components/ui/toaster";
import { Toaster as Sonner }           from "@/components/ui/sonner";
import { TooltipProvider }             from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }                from "@/hooks/useAuth";
import { LanguageProvider }            from "@/context/LanguageContext";
import AccessibilityPanel              from "@/components/AccessibilityPanel";
import HandGestureController           from "@/components/HandGestureController";
import EyeToggle                       from "@/components/EyeToggle";

// Pages
import Index           from "./pages/Index";
import Auth            from "./pages/Auth";
import Schemes         from "./pages/Schemes";
import Scholarships    from "./pages/Scholarships";
import Jobs            from "./pages/Jobs";
import Support         from "./pages/Support";
import Health          from "./pages/Health";
import Travel          from "./pages/Travel";
import SearchResults   from "./pages/SearchResults";
import EducationNearMe from "./pages/EducationNearMe";
import Dashboard       from "./pages/Dashboard";
import ProfileSetup    from "./pages/ProfileSetup";
import NotFound        from "./pages/NotFound";
import FAQ             from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>

          {/* ── Toast notifications (always mounted) ── */}
          <Toaster />
          <Sonner />

          {/* ══════════════════════════════════════════════════════════════
           *  MULTIMODAL CONTROLLERS — outside BrowserRouter
           *  Both stay mounted for the entire app session.
           *  Navigating between pages never unmounts them.
           * ══════════════════════════════════════════════════════════════ */}

          {/*
           * Hand Gesture Controller (MediaPipe)
           * - Camera stream persists across all route changes
           * - MediaPipe WASM model stays loaded in memory
           * - Gesture state is never reset by navigation
           */}
          <HandGestureController />

          {/*
           * Eye Tracking Toggle + Control System (WebGazer.js)
           * - Renders the bottom-left control panel (always visible)
           * - When enabled: mounts <EyeTracking> which owns the gaze loop
           * - When disabled: unmounts <EyeTracking> → calls webgazer.end()
           * - The toggle panel itself never unmounts (always accessible)
           * - gaze cursor (ez-cursor), dwell ring (ez-ring), and focus
           *   highlight (ez-highlight) are injected into document.body
           *   by EyeTracking.tsx and survive route changes
           * - Live status panel appears bottom-left ABOVE the toggle panel
           *   once calibration completes
           */}
          <EyeToggle />

          {/* ══════════════════════════════════════════════════════════════
           *  ROUTER — page-level components mount/unmount here
           * ══════════════════════════════════════════════════════════════ */}
          <BrowserRouter>

            {/*
             * Accessibility Panel — inside BrowserRouter because it
             * uses useNavigate / useLocation (requires router context)
             */}
            <AccessibilityPanel />

            <Routes>
              <Route path="/"                    element={<Index />} />
              <Route path="/auth"                element={<Auth />} />
              <Route path="/profile-setup"       element={<ProfileSetup />} />
              <Route path="/schemes"             element={<Schemes />} />
              <Route path="/scholarships"        element={<Scholarships />} />
              <Route path="/jobs"                element={<Jobs />} />
              <Route path="/support"             element={<Support />} />
              <Route path="/health"              element={<Health />} />
              <Route path="/travel"              element={<Travel />} />
              <Route path="/search-results"      element={<SearchResults />} />
              <Route path="/education/:category" element={<EducationNearMe />} />
              <Route path="/faq"                 element={<FAQ />} />
              <Route path="/dashboard"           element={<Dashboard />} />
              <Route path="*"                    element={<NotFound />} />
            </Routes>

          </BrowserRouter>

        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;