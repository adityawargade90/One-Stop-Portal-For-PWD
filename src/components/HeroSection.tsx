import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, Users, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import hero1 from "@/assets/hero-image1.png";
import hero2 from "@/assets/hero22.png";
import hero3 from "@/assets/hero2.jpeg";
import hero4 from "@/assets/hero4.jpeg";

/* ── 3D floating card helper ── */
function FloatingCard({ children, style, delay = "0s" }: { children: React.ReactNode; style?: React.CSSProperties; delay?: string }) {
  return (
    <div
      className="absolute glass rounded-2xl px-4 py-3 shadow-xl animate-float shimmer-card"
      style={{
        animationDelay: delay,
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.5)",
        background: "rgba(255,255,255,0.85)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  const [schemes, setSchemes]  = useState(0);
  const [jobs,    setJobs]     = useState(0);
  const [support, setSupport]  = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const images = [hero1, hero2, hero3, hero4];

  // Counters
  useEffect(() => {
    const t = setInterval(() => {
      setSchemes(p => p >= 500  ? 500  : p + 5);
      setJobs(p    => p >= 1000 ? 1000 : p + 10);
      setSupport(p => p >= 24   ? 24   : p + 1);
    }, 20);
    return () => clearInterval(t);
  }, []);

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => setCurrentIndex(p => (p + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Parallax mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = sectionRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - r.left) / r.width - 0.5) * 20,
        y: ((e.clientY - r.top)  / r.height - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const stats = [
    { value: `${schemes}+`, label: "Schemes",  grad: "linear-gradient(135deg, hsl(213 100% 38%), hsl(213 100% 58%))", icon: Star },
    { value: `${jobs}+`,    label: "Jobs",      grad: "linear-gradient(135deg, hsl(142 76% 28%), hsl(142 76% 48%))", icon: Zap  },
    { value: `${support}/7`,label: "Support",   grad: "linear-gradient(135deg, hsl(43 96% 38%),  hsl(43 96% 54%))",  icon: Users},
  ];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen py-20 overflow-hidden flex items-center"
      style={{
        background: "linear-gradient(150deg, hsl(213 100% 97%) 0%, hsl(0 0% 100%) 40%, hsl(270 70% 97%) 70%, hsl(142 60% 97%) 100%)",
      }}
    >
      {/* ── Animated 3D background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

        {/* Large orbs with parallax */}
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: 600, height: 600,
            top: "-10%", left: "-10%",
            background: "radial-gradient(circle, hsl(213 100% 60%), transparent 65%)",
            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: 500, height: 500,
            bottom: "-5%", right: "-5%",
            background: "radial-gradient(circle, hsl(270 70% 60%), transparent 65%)",
            transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: 350, height: 350,
            top: "30%", right: "20%",
            background: "radial-gradient(circle, hsl(142 76% 50%), transparent 65%)",
            transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(hsl(213 100% 50% / 0.09) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating geometric shapes */}
        {[
          { top:"8%",  left:"3%",  size:14, color:"hsl(213 100% 55%)", cls:"animate-particle-1" },
          { top:"75%", left:"2%",  size:10, color:"hsl(142 76% 42%)",  cls:"animate-particle-2" },
          { top:"15%", right:"4%", size:16, color:"hsl(43 96% 56%)",   cls:"animate-particle-3" },
          { top:"65%", right:"6%", size:10, color:"hsl(270 70% 58%)",  cls:"animate-particle-4" },
          { top:"45%", left:"8%",  size:8,  color:"hsl(0 84% 60%)",    cls:"animate-particle-1" },
        ].map((p: any, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${p.cls}`}
            style={{
              top: p.top, left: p.left, right: p.right,
              width: p.size, height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Spinning rings */}
        <div
          className="absolute rounded-full opacity-8"
          style={{
            width: 900, height: 900,
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            border: "1px dashed hsl(213 100% 65% / 0.25)",
            animation: "spin-y 30s linear infinite",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ── */}
          <div className="space-y-8 animate-slide-in-up">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-semibold shimmer-card"
              style={{
                background: "linear-gradient(135deg, hsl(213 100% 96%), hsl(213 100% 92%))",
                border: "1.5px solid hsl(213 100% 72%)",
                color: "hsl(213 100% 35%)",
                boxShadow: "0 4px 20px hsl(213 100% 50% / 0.18), 0 1px 0 rgba(255,255,255,0.8) inset",
              }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              AI-Powered Accessibility Platform
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground">
                Empowering{" "}
                <br />
                <span
                  className="animate-gradient-bg"
                  style={{
                    background: "linear-gradient(135deg, hsl(213 100% 35%), hsl(213 100% 58%), hsl(142 76% 38%), hsl(270 70% 55%), hsl(43 96% 50%), hsl(213 100% 40%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    backgroundSize: "400% 400%",
                  }}
                >
                  Persons with
                  <br />Disabilities
                </span>
              </h1>
              <p className="text-2xl font-semibold text-primary tracking-tight">
                All Resources in One Place
              </p>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Schemes, Scholarships, Jobs, Health, and Support made simple and accessible.
              Your one-stop destination for comprehensive disability services across India.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="text-base px-8 py-6 gap-2.5 font-semibold rounded-2xl relative overflow-hidden shimmer-card"
                style={{
                  background: "linear-gradient(135deg, hsl(213 100% 36%), hsl(213 100% 56%))",
                  border: "none",
                  boxShadow: "0 8px 32px hsl(213 100% 40% / 0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "translateY(-3px) scale(1.02)";
                  el.style.boxShadow = "0 20px 48px hsl(213 100% 40% / 0.5)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "";
                  el.style.boxShadow = "0 8px 32px hsl(213 100% 40% / 0.35)";
                }}
                onClick={() => navigate("/schemes")}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.4))" }} />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 font-semibold rounded-2xl relative overflow-hidden"
                style={{
                  border: "2px solid hsl(213 100% 68%)",
                  color: "hsl(213 100% 38%)",
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "translateY(-3px)";
                  el.style.background = "hsl(213 100% 96%)";
                  el.style.boxShadow = "0 12px 32px hsl(213 100% 50% / 0.2)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "";
                  el.style.background = "rgba(255,255,255,0.8)";
                  el.style.boxShadow = "";
                }}
                onClick={() => navigate("http://localhost:8081/")}
              >
                My Dashboard
              </Button>
            </div>

            {/* Stats — 3D cards */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="text-center p-4 rounded-2xl border shimmer-card cursor-default"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(10px)",
                      borderColor: "rgba(0,0,0,0.06)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = "perspective(500px) rotateX(-10deg) rotateY(8deg) translateZ(12px)";
                      el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = "";
                      el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                      style={{ background: s.grad }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div
                      className="text-xl font-bold"
                      style={{
                        background: s.grad,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { icon: Shield, text: "WCAG 2.1 AA", color: "#16a34a" },
                { icon: Star,   text: "Govt. of India", color: "hsl(43 96% 40%)" },
                { icon: Users,  text: "Multi-language",  color: "hsl(213 100% 40%)" },
              ].map(({ icon: Ic, text, color }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ic className="w-3.5 h-3.5" style={{ color }} />
                  {text}
                  {i < 2 && <span className="w-px h-3 bg-border ml-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — 3D image frame ── */}
          <div className="relative flex items-center justify-center animate-fade-in-right">

            {/* Floating UI cards around image */}
            <FloatingCard style={{ top: "5%", right: "-5%", zIndex: 10, minWidth: 130 }} delay="0s">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(142 76% 30%), hsl(142 76% 50%))" }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">AI Powered</div>
                  <div className="text-[10px] text-muted-foreground">Smart matching</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard style={{ bottom: "10%", left: "-5%", zIndex: 10, minWidth: 140 }} delay="1.5s">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(213 100% 36%), hsl(213 100% 56%))" }}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Accessible</div>
                  <div className="text-[10px] text-muted-foreground">WCAG 2.1 AA</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard style={{ top: "45%", left: "-8%", zIndex: 10, minWidth: 120 }} delay="0.8s">
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: "hsl(213 100% 40%)" }}>1000+</div>
                <div className="text-[10px] text-muted-foreground font-medium">Jobs Listed</div>
              </div>
            </FloatingCard>

            {/* Rotating rings */}
            <div className="absolute inset-0 rounded-full"
              style={{
                width: "95%", height: "95%", margin: "auto",
                border: "1.5px dashed hsl(213 100% 65% / 0.3)",
                animation: "spin-y 20s linear infinite",
              }}
            />
            <div className="absolute inset-0 rounded-full"
              style={{
                width: "75%", height: "75%", margin: "auto",
                border: "1px solid hsl(142 76% 50% / 0.2)",
                animation: "spin-y 32s linear infinite reverse",
              }}
            />

            {/* Main image frame */}
            <div
              className="relative w-full rounded-3xl overflow-hidden shimmer-card"
              style={{
                background: "linear-gradient(135deg, hsl(213 100% 50% / 0.1), hsl(270 70% 50% / 0.06))",
                border: "1.5px solid hsl(213 100% 72% / 0.3)",
                boxShadow: `
                  0 32px 80px rgba(37,99,235,0.18),
                  0 8px 24px rgba(0,0,0,0.08),
                  0 2px 0 rgba(255,255,255,0.9) inset
                `,
                transform: `perspective(1000px) rotateX(${-mousePos.y * 0.03}deg) rotateY(${mousePos.x * 0.03}deg)`,
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(37,99,235,0.05) 100%)",
                }}
              />

              <div className="p-5 relative">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="PWD Support"
                    className={`w-full h-auto rounded-2xl transition-all duration-1000 ${
                      idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    } ${idx > 0 ? "absolute top-5 left-5 right-5" : ""}`}
                    style={{ transition: "opacity 1s ease, transform 1s ease" }}
                  />
                ))}

                {/* Dots */}
                <div className="relative z-20 flex gap-2 justify-center mt-3" style={{ marginTop: "calc(100% * 0.5 + 10px)" }}>
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === currentIndex ? 24 : 8,
                        height: 8,
                        background: i === currentIndex
                          ? "linear-gradient(135deg, hsl(213 100% 46%), hsl(213 100% 62%))"
                          : "hsl(213 100% 82%)",
                        boxShadow: i === currentIndex ? "0 2px 8px hsl(213 100% 50% / 0.4)" : "none",
                      }}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
