import { Button } from "@/components/ui/button";
import { Globe, Menu, LogIn, Accessibility, X, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";

type Language = "English" | "Hindi" | "Marathi";

const LANGUAGES: { key: Language; label: string; native: string; flag: string }[] = [
  { key: "English", label: "English", native: "English", flag: "🇬🇧" },
  { key: "Marathi", label: "Marathi", native: "मराठी",   flag: "🇮🇳" },
  { key: "Hindi",   label: "Hindi",   native: "हिंदी",    flag: "🇮🇳" },
];

const Header = () => {
  const { language, setLanguage, t, isTranslating } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled]                 = useState(false);
  const [activeItem, setActiveItem]             = useState("/");
  const [langOpen, setLangOpen]                 = useState(false); // ← NEW
  const navigate    = useNavigate();
  const headerRef   = useRef<HTMLElement>(null);
  const langRef     = useRef<HTMLDivElement>(null); // ← NEW

  const navItems = [
    { name: t("nav.home"),         href: "/",            emoji: "🏠" },
    { name: t("nav.schemes"),      href: "/schemes",      emoji: "📋" },
    { name: t("nav.scholarships"), href: "/scholarships", emoji: "🎓" },
    { name: t("nav.jobs"),         href: "/jobs",         emoji: "💼" },
    { name: t("nav.support"),      href: "/support",      emoji: "🤝" },
    { name: t("FAQ"),              href: "/faq",          emoji: "❓" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    setActiveItem(window.location.pathname);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close lang dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.key === language) ?? LANGUAGES[0];

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(28px) saturate(220%)",
        WebkitBackdropFilter: "blur(28px) saturate(220%)",
        borderBottom: scrolled
          ? "1px solid rgba(37,99,235,0.12)"
          : "1px solid rgba(255,255,255,0.3)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(37,99,235,0.10), 0 1px 0 rgba(255,255,255,0.8) inset"
          : "none",
      }}
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(213 100% 40%), hsl(142 76% 40%), hsl(43 96% 56%), hsl(270 70% 58%), hsl(213 100% 40%))",
          backgroundSize: "300% 100%",
          animation: "gradient-rotate 4s linear infinite",
        }}
      />

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <a
            href="/"
            className="flex items-center gap-3 shrink-0 group"
            aria-label="DivyangConnect Home"
          >
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(213 100% 35%), hsl(213 100% 58%))",
                transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "perspective(400px) rotateY(25deg) rotateX(-5deg) scale(1.12)";
                el.style.boxShadow = "0 12px 28px hsl(213 100% 40% / 0.5), -4px 4px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "";
                el.style.boxShadow = "";
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 50%)",
                  borderRadius: "inherit",
                }}
              />
              <Accessibility className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="hidden sm:block">
              <div
                className="text-base font-bold leading-tight tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(213 100% 30%), hsl(213 100% 55%), hsl(142 76% 38%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                  animation: "gradient-rotate 5s ease infinite",
                }}
              >
                {t("portal.title")}
              </div>
              <p className="text-[10px] text-muted-foreground tracking-wide">
                {t("portal.subtitle")}
              </p>
            </div>
          </a>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = activeItem === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveItem(item.href)}
                  className="relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    color: isActive ? "hsl(213 100% 40%)" : "hsl(220 13% 35%)",
                    background: isActive ? "hsl(213 100% 96%)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "hsl(213 100% 97%)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "hsl(213 100% 40%)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "hsl(220 13% 35%)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "";
                    }
                  }}
                >
                  {item.name}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                      style={{ background: "hsl(213 100% 50%)" }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* ── LANGUAGE DROPDOWN (replaces old cycle button) ── */}
            <div
              ref={langRef}
              className="relative hidden sm:block"
            >
              {/* Trigger */}
              <button
                onClick={() => !isTranslating && setLangOpen((v) => !v)}
                disabled={isTranslating}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Select language"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200"
                style={{
                  borderColor: isTranslating ? "rgba(99,102,241,0.4)" : "rgba(37,99,235,0.2)",
                  color: isTranslating ? "#6366f1" : "hsl(213 100% 40%)",
                  background: isTranslating ? "rgba(99,102,241,0.08)" : "hsl(213 100% 98%)",
                  opacity: isTranslating ? 0.8 : 1,
                  cursor: isTranslating ? "not-allowed" : "pointer",
                }}
                title={isTranslating ? "Translating..." : "Change language"}
              >
                {isTranslating ? (
                  <span
                    style={{
                      width: 12, height: 12, borderRadius: "50%",
                      border: "2px solid rgba(99,102,241,0.3)",
                      borderTopColor: "#6366f1",
                      display: "inline-block",
                      animation: "spin-y 0.6s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                <span style={{ fontSize: 14 }}>{current.flag}</span>
                {current.label}
                <ChevronDown
                  className="w-3 h-3 opacity-50"
                  style={{
                    transition: "transform 0.2s",
                    transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Dropdown menu */}
              {langOpen && (
                <div
                  role="listbox"
                  aria-label="Language options"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    minWidth: 180,
                    borderRadius: 12,
                    border: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-primary)",
                    overflow: "hidden",
                    zIndex: 9999,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  }}
                >
                  {LANGUAGES.map((lang) => {
                    const isActive = lang.key === language;
                    return (
                      <button
                        key={lang.key}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectLanguage(lang.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: 13,
                          cursor: "pointer",
                          border: "none",
                          textAlign: "left",
                          background: isActive
                            ? "hsl(213 100% 96%)"
                            : "var(--color-background-primary)",
                          color: isActive
                            ? "hsl(213 100% 40%)"
                            : "var(--color-text-primary)",
                          fontWeight: isActive ? 500 : 400,
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "var(--color-background-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "var(--color-background-primary)";
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{lang.flag}</span>
                        <span>{lang.label}</span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 11,
                            color: isActive
                              ? "hsl(213 100% 55%)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {lang.native}
                        </span>
                        {isActive && (
                          <Check
                            size={13}
                            style={{ color: "hsl(213 100% 40%)", flexShrink: 0 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* ── END LANGUAGE DROPDOWN ── */}

            {/* Dashboard */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("http://localhost:8081/")}
              className="hidden sm:flex gap-1.5 text-xs font-semibold rounded-xl border-2 transition-all duration-200"
              style={{
                borderColor: "hsl(213 100% 70%)",
                color: "hsl(213 100% 40%)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 4px 12px hsl(213 100% 40% / 0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "";
                el.style.boxShadow = "";
              }}
            >
              Dashboard
            </Button>

            {/* Sign In */}
            <Button
              size="sm"
              onClick={() => navigate("http://localhost:8081/")}
              className="gap-1.5 text-xs font-semibold shadow-lg rounded-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(213 100% 38%), hsl(213 100% 58%))",
                border: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "translateY(-2px) scale(1.03)";
                el.style.boxShadow = "0 8px 20px hsl(213 100% 40% / 0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "";
                el.style.boxShadow = "";
              }}
            >
              <div
                className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.5))",
                }}
              />
              <LogIn className="w-3.5 h-3.5 relative z-10" />
              <span className="hidden sm:inline relative z-10">{t("nav.login")}</span>
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden rounded-xl"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {isMobileMenuOpen && (
          <nav
            className="lg:hidden mt-3 pb-3 border-t pt-3 animate-slide-in-up"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: "hsl(220 13% 35%)" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "hsl(213 100% 96%)";
                    el.style.color = "hsl(213 100% 40%)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = "";
                    el.style.color = "hsl(220 13% 35%)";
                  }}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.name}
                </a>
              ))}

              {/* ── Mobile language options (3 buttons, no dropdown needed) ── */}
              <div className="pt-2 border-t mt-1">
                <p className="px-1 pb-1 text-xs text-muted-foreground">Language</p>
                <div className="flex gap-2 flex-wrap px-1">
                  {LANGUAGES.map((lang) => {
                    const isActive = lang.key === language;
                    return (
                      <button
                        key={lang.key}
                        onClick={() => {
                          handleSelectLanguage(lang.key);
                          setIsMobileMenuOpen(false);
                        }}
                        disabled={isTranslating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                        style={{
                          borderColor: isActive
                            ? "hsl(213 100% 50%)"
                            : "rgba(0,0,0,0.12)",
                          color: isActive
                            ? "hsl(213 100% 40%)"
                            : "hsl(220 13% 45%)",
                          background: isActive
                            ? "hsl(213 100% 96%)"
                            : "transparent",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{lang.flag}</span>
                        {lang.label}
                        <span style={{ fontSize: 11, opacity: 0.7 }}>{lang.native}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;