import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Users, 
  ArrowLeft,
  Phone,
  Mail,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";
import React, { useRef } from "react";

const Jobs = () => {
  const navigate = useNavigate();

  // 🔥 NEW FEATURE STATES
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lon: number } | null>(null);
  const [accessibilityFilter, setAccessibilityFilter] = React.useState<string | null>(null);

  // Dummy user skills
  const userSkills = ["Basic computer skills", "Typing speed 30+ WPM"];

  // 🔥 Get User Location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      });
    }
  }, []);

  // 🔥 Match Score
  const calculateMatchScore = (requirements:string[]) => {
    const matched = requirements.filter(skill => userSkills.includes(skill));
    return Math.round((matched.length / requirements.length) * 100);
  };

 const jobs = [
    // Government sector jobs
    {
      id: 1,
      title: "Data Entry Operator",
      company: "TCS - Tata Consultancy Services",
      location: "Mumbai, Maharashtra",
      salary: "₹15,000 - ₹25,000/month",
      type: "Full-time",
      experience: "0-2 years",
      disability: ["Visual", "Hearing", "Physical"],
      description: "Data entry and processing role with accessibility support and assistive technology",
      requirements: ["Basic computer skills", "Typing speed 30+ WPM", "10th/12th qualification"],
      posted: "2 days ago",
      applications: 45,
      category: "government"
    },
    {
      id: 2,
      title: "Clerical Assistant",
      company: "Ministry of Social Justice",
      location: "New Delhi",
      salary: "₹20,000 - ₹30,000/month",
      type: "Full-time",
      experience: "1-3 years",
      disability: ["Physical", "Hearing"],
      description: "Office clerical assistant for government social justice department",
      requirements: ["Graduate degree", "Basic computer knowledge", "Good communication"],
      posted: "5 days ago",
      applications: 50,
      category: "government"
    },

    // Private sector jobs
    {
      id: 3,
      title: "Customer Support Executive",
      company: "HDFC Bank",
      location: "Pune, Maharashtra",
      salary: "₹18,000 - ₹30,000/month",
      type: "Full-time",
      experience: "1-3 years",
      disability: ["Hearing", "Physical"],
      description: "Handle customer queries via chat and email with sign language interpretation support",
      requirements: ["Good communication skills", "Graduate degree", "Customer service experience"],
      posted: "1 week ago",
      applications: 78,
      category: "private"
    },
    {
      id: 4,
      title: "Software Developer Trainee",
      company: "Infosys Limited",
      location: "Bangalore, Karnataka",
      salary: "₹25,000 - ₹40,000/month",
      type: "Full-time",
      experience: "Fresh Graduate",
      disability: ["Physical", "Visual"],
      description: "Entry-level software development position with comprehensive training program",
      requirements: ["Computer Science degree", "Programming knowledge", "Problem-solving skills"],
      posted: "3 days ago",
      applications: 125,
      category: "private"
    },

    // NGO sector jobs
    {
      id: 5,
      title: "Rehabilitation Specialist",
      company: "Sarthak Educational Trust",
      location: "New Delhi",
      salary: "₹20,000 - ₹35,000/month",
      type: "Full-time",
      experience: "3-5 years",
      disability: ["All"],
      description: "Providing support and rehabilitation guidance for persons with disabilities",
      requirements: ["Relevant degree", "Experience in disability sector", "Compassionate attitude"],
      posted: "5 days ago",
      applications: 30,
      category: "ngo"
    },
    {
      id: 6,
      title: "Program Assistant",
      company: "NGO Welfare Foundation",
      location: "Chennai, Tamil Nadu",
      salary: "₹15,000 - ₹25,000/month",
      type: "Part-time",
      experience: "1-2 years",
      disability: ["All"],
      description: "Assist in planning and coordination of disability welfare programs",
      requirements: ["Graduate degree", "Admin experience", "MS Office proficiency"],
      posted: "10 days ago",
      applications: 20,
      category: "ngo"
    },

    // Freelance jobs
    {
      id: 7,
      title: "Freelance Graphic Designer",
      company: "Self Employed",
      location: "Remote",
      salary: "₹1200 - ₹4000/hour",
      type: "Contract",
      experience: "Open",
      disability: ["Physical", "Visual"],
      description: "Flexible project-based graphic design work for clients worldwide",
      requirements: ["Portfolio of designs", "Proficiency in design software", "Reliable communication"],
      posted: "10 days ago",
      applications: 12,
      category: "freelance"
    },
    {
      id: 8,
      title: "Content Writer",
      company: "Online",
      location: "Remote",
      salary: "₹800 - ₹2500 per article",
      type: "Contract",
      experience: "Open",
      disability: ["All"],
      description: "Write accessible and SEO optimized content focused on disability topics",
      requirements: ["Good writing skills", "Research ability", "Time management"],
      posted: "15 days ago",
      applications: 18,
      category: "freelance"
    },

    // Remote jobs
    {
      id: 9,
      title: "Virtual Assistant",
      company: "Tech Solutions Inc.",
      location: "Remote",
      salary: "₹10,000 - ₹20,000/month",
      type: "Part-time",
      experience: "0-1 year",
      disability: ["All"],
      description: "Assist with scheduling, email management, and data entry remotely",
      requirements: ["Good organizational skills", "Basic computer knowledge", "Reliable internet"],
      posted: "3 days ago",
      applications: 60,
      category: "remote"
    },
    {
      id: 10,
      title: "Remote Sales Representative",
      company: "Global Connect",
      location: "Remote",
      salary: "₹15,000 - ₹35,000/month",
      type: "Full-time",
      experience: "2-4 years",
      disability: ["Visual", "Physical"],
      description: "Remote sales operations with flexible working hours and assistive technology for disabled employees",
      requirements: ["Sales experience", "Communication skills", "CRM software knowledge"],
      posted: "1 week ago",
      applications: 45,
      category: "remote"
    },
  ];


  const categories = ["All Jobs", "Government", "Private", "NGO", "Freelance", "Remote"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<Briefcase className="w-12 h-12" style={{ color: "hsl(270 70% 45%)" }} />}
          iconColor="hsl(270 70% 45%)"
          iconBg="hsl(270 70% 94%)"
          title="Jobs & Skills"
          subtitle="Employment opportunities, skill development programs, and career guidance for PWDs"
          badge="Career Opportunities"
        />

        <section className="py-10 page-3d-bg">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            {/* 🔥 Accessibility Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="text-sm font-medium self-center text-muted-foreground">Filter by disability:</span>
              {["Visual", "Hearing", "Physical"].map(type => (
                <Button
                  key={type}
                  variant={accessibilityFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAccessibilityFilter(prev => prev === type ? null : type)}
                >
                  {type === "Visual" ? "👁" : type === "Hearing" ? "👂" : "♿"} {type}
                </Button>
              ))}
              {accessibilityFilter && (
                <Button variant="ghost" size="sm" onClick={() => setAccessibilityFilter(null)}>Clear</Button>
              )}
            </div>

            <Tabs defaultValue="all-jobs" className="mb-8">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all-jobs" className="space-y-6">
                <div className="grid gap-6">
                  {jobs
                    .filter(job => accessibilityFilter ? job.disability.includes(accessibilityFilter) : true)
                    .map((job) => (
                    <JobCard key={job.id} job={job} calculateMatchScore={calculateMatchScore} userLocation={userLocation} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

/** Skills the current user already has – used to compute skill gap in job cards */
const BASE_USER_SKILLS = ["Basic computer skills", "Typing speed 30+ WPM"] as const;

/* ── 3D Job Card component ── */
function JobCard({ job, calculateMatchScore, userLocation }: {
  job: { id: number; title: string; company: string; location: string; salary: string; type: string; experience: string; disability: string[]; description: string; requirements: string[]; posted: string; applications: number; category: string };
  calculateMatchScore: (req: string[]) => number;
  userLocation: { lat: number; lon: number } | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -5;
    const ry = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 5;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 24px hsl(270 70% 45% / 0.15)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "";
    cardRef.current.style.boxShadow = "";
  };

  const score = calculateMatchScore(job.requirements);

  return (
    <div
      ref={cardRef}
      className="rounded-xl border border-border/60 bg-card shimmer-card gradient-border overflow-hidden"
      style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease", willChange: "transform" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge style={{ background: "hsl(142 76% 90%)", color: "hsl(142 76% 25%)" }}>
            🔥 {score}% Match
          </Badge>
          {userLocation && (
            <Badge variant="secondary">📍 {Math.floor(Math.random() * 10 + 1)} km away</Badge>
          )}
          <Badge variant="outline">{job.type}</Badge>
          {job.disability.map(d => (
            <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
          ))}
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">{job.title}</h3>
        <p className="text-sm text-muted-foreground mb-1">{job.company}</p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{job.salary}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.experience}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applications} applied</span>
        </div>

        <p className="text-muted-foreground text-sm mb-4">{job.description}</p>

        {/* Skill gap */}
        {job.requirements.filter(req => !BASE_USER_SKILLS.includes(req as typeof BASE_USER_SKILLS[number])).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 text-sm">
            <p className="font-semibold text-yellow-700 mb-1">❗ Skills to develop:</p>
            <div className="flex flex-wrap gap-1">
              {job.requirements.filter(req => !BASE_USER_SKILLS.includes(req as typeof BASE_USER_SKILLS[number])).map((skill, i) => (
                <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open("tel:+919999999999")}>
            <Phone className="w-3 h-3 mr-1" />Call HR
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open("mailto:hr@company.com")}>
            <Mail className="w-3 h-3 mr-1" />Email HR
          </Button>
          <Button
            size="sm"
            className="flex-1 shimmer-card"
            style={{ transition: "transform 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
