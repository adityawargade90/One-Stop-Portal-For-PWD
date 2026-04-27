import { useRef } from "react";

interface PageHero3DProps {
  /** Page icon (React element) */
  icon: React.ReactNode;
  /** Color used for the icon background and accent orbs — a CSS color string */
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
}

/**
 * Reusable 3D animated page-hero header.
 * Renders a full-width section with:
 *  - animated gradient background + floating orbs
 *  - 3D perspective icon container
 *  - animated gradient heading text
 *  - entrance animations
 */
const PageHero3D = ({ icon, iconColor, iconBg, title, subtitle, badge }: PageHero3DProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = iconRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `perspective(600px) rotateX(${(-y / rect.height) * 20}deg) rotateY(${(x / rect.width) * 20}deg) scale(1.08)`;
  };

  const handleMouseLeave = () => {
    if (iconRef.current) iconRef.current.style.transform = "";
  };

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(213 100% 97%) 0%, hsl(0 0% 100%) 50%, hsl(210 20% 97%) 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-12 -left-12 w-56 h-56 rounded-full opacity-15 animate-float"
          style={{ background: `radial-gradient(circle, ${iconColor}, transparent 70%)` }}
        />
        <div
          className="absolute top-1/3 -right-16 w-64 h-64 rounded-full opacity-10 animate-float-slow"
          style={{ background: `radial-gradient(circle, ${iconColor}, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10 animate-float-delayed"
          style={{ background: "radial-gradient(circle, hsl(142 76% 40%), transparent 70%)" }}
        />
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(hsl(213 100% 50% / 0.1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4">
        {badge && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 animate-slide-in-up"
            style={{
              background: iconBg,
              color: iconColor,
              border: `1px solid ${iconColor}40`,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: iconColor }} />
            {badge}
          </div>
        )}

        {/* 3D icon */}
        <div
          ref={iconRef}
          className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-scale-in shimmer-card"
          style={{
            background: iconBg,
            border: `1px solid ${iconColor}30`,
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            willChange: "transform",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {icon}
        </div>

        {/* Animated gradient title */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-up animate-gradient-bg"
          style={{
            background: `linear-gradient(135deg, ${iconColor}, hsl(213 100% 60%), ${iconColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundSize: "200% 200%",
          }}
        >
          {title}
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-right">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default PageHero3D;
