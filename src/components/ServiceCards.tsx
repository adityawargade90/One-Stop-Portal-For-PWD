import { Button } from "@/components/ui/button";
import {
  Building2, GraduationCap, Briefcase,
  Heart, Plane, Phone, ArrowRight, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

const services = [
  {
    icon: Building2,
    title: "Schemes & Benefits",
    description: "Government schemes, financial assistance, and disability benefits across India",
    grad: "linear-gradient(135deg, hsl(213 100% 38%), hsl(213 100% 58%))",
    bg: "linear-gradient(135deg, hsl(213 100% 97%), hsl(213 100% 93%))",
    glow: "hsl(213 100% 50%)",
    num: "500+", numLabel: "Schemes",
    route: "/schemes",
    emoji: "📋",
  },
  {
    icon: GraduationCap,
    title: "Scholarships",
    description: "Educational scholarships, grants, and funding for students with disabilities",
    grad: "linear-gradient(135deg, hsl(142 76% 28%), hsl(142 76% 48%))",
    bg: "linear-gradient(135deg, hsl(142 76% 97%), hsl(142 76% 93%))",
    glow: "hsl(142 76% 42%)",
    num: "200+", numLabel: "Scholarships",
    route: "/scholarships",
    emoji: "🎓",
  },
  {
    icon: Briefcase,
    title: "Jobs & Skills",
    description: "Employment opportunities, skill development programs, and career guidance",
    grad: "linear-gradient(135deg, hsl(270 70% 38%), hsl(270 70% 58%))",
    bg: "linear-gradient(135deg, hsl(270 70% 97%), hsl(270 70% 93%))",
    glow: "hsl(270 70% 50%)",
    num: "1000+", numLabel: "Job Listings",
    route: "/jobs",
    emoji: "💼",
  },
  {
    icon: Heart,
    title: "Health & UDID",
    description: "Healthcare services, UDID registration, and medical support resources",
    grad: "linear-gradient(135deg, hsl(0 84% 42%), hsl(0 84% 62%))",
    bg: "linear-gradient(135deg, hsl(0 84% 97%), hsl(0 84% 94%))",
    glow: "hsl(0 84% 52%)",
    num: "50+", numLabel: "Hospitals",
    route: "/health",
    emoji: "❤️",
  },
  {
    icon: Plane,
    title: "Travel Concessions",
    description: "Railway, airline, and public transport concessions and booking assistance",
    grad: "linear-gradient(135deg, hsl(25 95% 38%), hsl(25 95% 58%))",
    bg: "linear-gradient(135deg, hsl(25 95% 97%), hsl(25 95% 94%))",
    glow: "hsl(25 95% 48%)",
    num: "75%", numLabel: "Max Discount",
    route: "/travel",
    emoji: "✈️",
  },
  {
    icon: Phone,
    title: "Helplines & Support",
    description: "24/7 helplines, counseling services, and emergency support contacts",
    grad: "linear-gradient(135deg, hsl(174 72% 26%), hsl(174 72% 46%))",
    bg: "linear-gradient(135deg, hsl(174 72% 97%), hsl(174 72% 93%))",
    glow: "hsl(174 72% 38%)",
    num: "24/7", numLabel: "Support",
    route: "/support",
    emoji: "📞",
  },
];

/* ── 3D Tilt Card ── */
function ServiceCard({ s, navigate }: { s: typeof services[0]; navigate: (p: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -14;
    const ry = ((x - r.width / 2) / r.width) * 14;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(16px)`;
    el.style.boxShadow = `${-ry * 1.5}px ${rx * 1.5}px 48px ${s.glow}40, 0 20px 60px rgba(0,0,0,0.12)`;
  };

  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
    setHovered(false);
  };

  const Icon = s.icon;

  return (
    <div
      ref={ref}
      className="relative cursor-pointer rounded-3xl overflow-hidden border border-white/80 shimmer-card"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        transition: "transform 0.15s cubic-bezier(0.23,1,0.32,1), box-shadow 0.15s ease",
        willChange: "transform",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,1) inset",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setHovered(true)}
      onClick={() => navigate(s.route)}
    >
      {/* Top gradient bar */}
      <div className="h-1 w-full" style={{ background: s.grad }} />

      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: s.bg,
          opacity: hovered ? 0.4 : 0,
        }}
      />

      {/* Corner number badge */}
      <div
        className="absolute top-4 right-4 px-2.5 py-1 rounded-xl text-xs font-bold"
        style={{
          background: s.bg,
          color: s.glow,
          border: `1px solid ${s.glow}30`,
        }}
      >
        {s.num}
      </div>

      <div className="p-6 relative z-10">
        {/* 3D Icon */}
        <div className="relative mb-5 w-fit">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-400"
            style={{
              background: s.grad,
              transform: hovered ? "perspective(400px) rotateY(15deg) rotateX(-5deg) scale(1.1) translateZ(8px)" : "",
              boxShadow: hovered ? `0 12px 28px ${s.glow}50` : `0 6px 16px ${s.glow}30`,
              transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
            }}
          >
            {/* Shine */}
            <div
              className="absolute inset-0 rounded-2xl opacity-30"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, transparent 60%)" }}
            />
            <Icon className="w-7 h-7 text-white relative z-10" />
          </div>
          {/* Glow ring */}
          {hovered && (
            <div
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ boxShadow: `0 0 0 6px ${s.glow}20`, borderRadius: "1rem" }}
            />
          )}
        </div>

        <h3
          className="text-lg font-bold mb-2 transition-all duration-200"
          style={{ color: hovered ? s.glow : "hsl(220 100% 6%)" }}
        >
          {s.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm mb-5">{s.description}</p>

        {/* Stat pill */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
          style={{ background: s.bg, color: s.glow, border: `1px solid ${s.glow}25` }}
        >
          <span>{s.emoji}</span>
          <span>{s.numLabel}</span>
        </div>

        <Button
          className="w-full font-semibold rounded-xl relative overflow-hidden transition-all duration-300"
          style={{
            background: hovered ? s.grad : "transparent",
            border: `2px solid ${s.glow}60`,
            color: hovered ? "white" : s.glow,
            transform: hovered ? "translateY(-1px)" : "",
            boxShadow: hovered ? `0 6px 20px ${s.glow}40` : "none",
          }}
          onClick={ev => { ev.stopPropagation(); navigate(s.route); }}
        >
          Explore
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200" style={{ transform: hovered ? "translateX(3px)" : "" }} />
        </Button>
      </div>
    </div>
  );
}

const ServiceCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "hsl(213 100% 99%)" }}>
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(hsl(213 100% 50% / 0.07) 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-6 blur-3xl"
          style={{ background: "hsl(213 100% 55%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-6 blur-3xl"
          style={{ background: "hsl(142 76% 45%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-5 shimmer-card"
            style={{
              background: "linear-gradient(135deg, hsl(213 100% 96%), hsl(213 100% 92%))",
              border: "1px solid hsl(213 100% 78%)",
              color: "hsl(213 100% 36%)",
              boxShadow: "0 2px 12px hsl(213 100% 50% / 0.15)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Everything you need, in one place
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold mb-5 tracking-tight animate-gradient-bg"
            style={{
              background: "linear-gradient(135deg, hsl(213 100% 28%), hsl(213 100% 52%), hsl(142 76% 36%), hsl(270 70% 48%), hsl(213 100% 40%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "300% 300%",
            }}
          >
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive support designed to empower persons with disabilities across India
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ServiceCard key={i} s={s} navigate={navigate} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
