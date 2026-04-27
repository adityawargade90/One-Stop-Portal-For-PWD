import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { 
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ArrowRight
} from "lucide-react";

const EducationSection = () => {
  const navigate = useNavigate();
  
  const educationServices = [
    {
      icon: GraduationCap,
      title: "Schools for Special Needs",
      description: "Find inclusive schools and special education institutions near you",
      iconBg: "hsl(213 100% 95%)",
      iconColor: "hsl(213 100% 40%)",
      category: "schools"
    },
    {
      icon: BookOpen,
      title: "Colleges & Universities",
      description: "Higher education institutions with disability support services",
      iconBg: "hsl(142 76% 92%)",
      iconColor: "hsl(142 76% 30%)",
      category: "colleges"
    },
    {
      icon: Users,
      title: "Coaching Centers",
      description: "Specialized coaching and tutoring services for competitive exams",
      iconBg: "hsl(270 70% 94%)",
      iconColor: "hsl(270 70% 45%)",
      category: "coaching"
    },
    {
      icon: Award,
      title: "Skill Development",
      description: "Vocational training programs and certification courses",
      iconBg: "hsl(25 95% 93%)",
      iconColor: "hsl(25 95% 40%)",
      category: "skill-development"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(210 20% 96%) 0%, hsl(0 0% 100%) 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-25" aria-hidden="true"
        style={{
          backgroundImage: "linear-gradient(hsl(213 100% 50% / 0.06) 1px, transparent 1px), linear-gradient(to right, hsl(213 100% 50% / 0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 animate-gradient-bg"
            style={{
              background: "linear-gradient(135deg, hsl(213 100% 30%), hsl(142 76% 36%), hsl(213 100% 30%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
            }}
          >
            Educational Institutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover schools, colleges, and educational programs designed to support students with disabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {educationServices.map((service, index) => {
            const Icon = service.icon;
            return <EduTiltCard key={index} service={service} navigate={navigate} Icon={Icon} />;
          })}
        </div>
      </div>
    </section>
  );
};

function EduTiltCard({ service, navigate, Icon }: {
  service: {
    title: string; description: string;
    iconBg: string; iconColor: string; category: string;
  };
  navigate: (path: string) => void;
  Icon: React.ElementType;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -10;
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 24px hsl(213 100% 40% / 0.18)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
    card.style.boxShadow = "";
  };

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer shimmer-card gradient-border rounded-xl border border-border/60 bg-card hover:border-primary/20 transition-colors duration-300"
      style={{
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/education/${service.category}`)}
    >
      <div className="p-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: service.iconBg }}
        >
          <Icon className="w-7 h-7" style={{ color: service.iconColor }} />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">{service.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
          onClick={e => { e.stopPropagation(); navigate(`/education/${service.category}`); }}
        >
          Find Near Me
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
}

export default EducationSection;