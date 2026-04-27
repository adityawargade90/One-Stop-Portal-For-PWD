import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(213 100% 97%), hsl(0 0% 100%) 50%, hsl(210 20% 96%))" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-15 animate-float"
          style={{ background: "radial-gradient(circle, hsl(213 100% 55%), transparent 70%)" }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10 animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(0 84% 60%), transparent 70%)" }} />
        <div className="absolute top-1/2 left-10 w-40 h-40 rounded-full opacity-10 animate-float-delayed"
          style={{ background: "radial-gradient(circle, hsl(43 96% 55%), transparent 70%)" }} />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(hsl(213 100% 50% / 0.1) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-4 animate-slide-in-up">
        {/* Animated 404 */}
        <div className="mb-6">
          <div
            className="text-9xl font-black leading-none animate-gradient-bg"
            style={{
              background: "linear-gradient(135deg, hsl(213 100% 40%), hsl(0 84% 60%), hsl(43 96% 50%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
            }}
          >
            404
          </div>
          {/* floating orb under 404 */}
          <div className="w-16 h-1 rounded-full mx-auto mt-2 animate-glow"
            style={{ background: "hsl(213 100% 50%)" }} />
        </div>

        {/* 3D icon card */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shimmer-card card-3d"
          style={{
            background: "hsl(213 100% 95%)",
            border: "1px solid hsl(213 100% 75%)",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "perspective(600px) rotateY(15deg) scale(1.1)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "";
          }}
        >
          <span className="text-4xl">🔍</span>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="gap-2 shimmer-card"
            style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 28px hsl(213 100% 40% / 0.35)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
            }}
          >
            <a href="/">
              <Home className="w-4 h-4" />
              Return to Home
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.history.back()}
            style={{ transition: "transform 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
