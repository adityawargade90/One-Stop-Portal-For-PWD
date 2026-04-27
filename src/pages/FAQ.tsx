import React, { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is the purpose of this portal?",
    answer:
      "This portal helps Persons with Disabilities (PWD) access job opportunities, government schemes, scholarships, and educational resources in one place.",
    category: "General",
  },
  {
    question: "Who can use this platform?",
    answer:
      "PWD individuals, NGOs, government organizations, and employers looking to hire inclusive talent can use this platform.",
    category: "General",
  },
  {
    question: "Is registration free?",
    answer:
      "Yes. Registration and all basic services on this portal are completely free for PWD users.",
    category: "Account",
  },
  {
    question: "How does AI job recommendation work?",
    answer:
      "The AI analyzes user skills, interests, education, and disability type to recommend the most suitable job opportunities.",
    category: "Jobs",
  },
  {
    question: "Can visually impaired users use this website?",
    answer:
      "Yes. The website supports screen readers, high contrast UI, and keyboard navigation to ensure full accessibility.",
    category: "Accessibility",
  },
  {
    question: "What types of jobs are available?",
    answer:
      "The platform includes remote jobs, government jobs, internships, part-time jobs, and inclusive company hiring programs.",
    category: "Jobs",
  },
  {
    question: "How can employers post jobs?",
    answer:
      "Employers can create an account and post accessible job opportunities specifically designed for inclusive hiring.",
    category: "Jobs",
  },
  {
    question: "Does the portal provide government scheme information?",
    answer:
      "Yes. The portal provides updated information about government schemes, financial aid, and disability benefits.",
    category: "Schemes",
  },
  {
    question: "Can students apply for scholarships?",
    answer:
      "Yes. Students with disabilities can explore and apply for various scholarships listed on the portal.",
    category: "Scholarships",
  },
  {
    question: "Is my personal data secure?",
    answer:
      "Yes. The platform uses secure authentication and encryption to protect user information.",
    category: "Account",
  },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  General:       { bg: "hsl(213 100% 94%)", text: "hsl(213 100% 35%)" },
  Account:       { bg: "hsl(142 76% 90%)",  text: "hsl(142 76% 30%)" },
  Jobs:          { bg: "hsl(270 70% 93%)",  text: "hsl(270 70% 40%)" },
  Accessibility: { bg: "hsl(25 95% 92%)",   text: "hsl(25 95% 38%)" },
  Schemes:       { bg: "hsl(0 84% 93%)",    text: "hsl(0 84% 40%)" },
  Scholarships:  { bg: "hsl(43 96% 88%)",   text: "hsl(43 96% 38%)" },
};

/* 3D accordion card */
function FAQCard({ faq, index }: { faq: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || open) return;
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -6;
    const ry = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 6;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 20px hsl(213 100% 40% / 0.15)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "";
    cardRef.current.style.boxShadow = "";
  };

  const color = categoryColors[faq.category] ?? categoryColors["General"];

  return (
    <div
      ref={cardRef}
      className="rounded-xl border border-border/60 bg-card overflow-hidden shimmer-card gradient-border"
      style={{
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
        animationDelay: `${index * 0.05}s`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-1">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: color.bg, color: color.text }}
          >
            {faq.category}
          </span>
          <span className="font-semibold text-foreground text-sm md:text-base">{faq.question}</span>
        </div>
        <span className="flex-shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {open && (
        <div
          className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm md:text-base animate-slide-in-up border-t border-border/40 pt-4"
        >
          {faq.answer}
        </div>
      )}
    </div>
  );
}

const FAQ: React.FC = () => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(faqData.map(f => f.category)))];
  const filtered = filter === "All" ? faqData : faqData.filter(f => f.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<HelpCircle className="w-12 h-12" style={{ color: "hsl(213 100% 40%)" }} />}
          iconColor="hsl(213 100% 40%)"
          iconBg="hsl(213 100% 95%)"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about DivyangConnect-AI and how we support persons with disabilities."
          badge="Help Center"
        />

        <section className="py-12 page-3d-bg">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
                  style={
                    filter === cat
                      ? { background: "hsl(213 100% 40%)", color: "white", borderColor: "hsl(213 100% 40%)" }
                      : { background: "transparent", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }
                  }
                  aria-pressed={filter === cat}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Cards */}
            <div className="space-y-4">
              {filtered.map((faq, index) => (
                <FAQCard key={index} faq={faq} index={index} />
              ))}
            </div>

            {/* Still have questions? */}
            <div
              className="mt-12 rounded-2xl p-8 text-center shimmer-card"
              style={{
                background: "linear-gradient(135deg, hsl(213 100% 97%), hsl(142 76% 96%))",
                border: "1px solid hsl(213 100% 85%)",
              }}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is available 24/7 to help you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/support"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:-translate-y-1"
                  style={{ background: "hsl(213 100% 40%)" }}
                >
                  Contact Support
                </a>
                <a
                  href="mailto:support@onestopportal.gov.in"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold border transition-all hover:-translate-y-1"
                  style={{ borderColor: "hsl(213 100% 40%)", color: "hsl(213 100% 40%)" }}
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;