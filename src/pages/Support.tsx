import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Clock, 
  MapPin, 
  ArrowLeft,
  Heart,
  Users,
  AlertCircle,
  Headphones
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";

const Support = () => {
  const navigate = useNavigate();

  const helplines = [
    {
      name: "National Disability Helpline",
      number: "1800-233-4444",
      type: "24/7 Support",
      services: ["Emergency assistance", "General queries", "Scheme information"],
      languages: ["English", "Hindi", "Regional"]
    },
    {
      name: "UDID Registration Support",
      number: "1800-111-3333", 
      type: "Working Hours",
      services: ["UDID card issues", "Registration help", "Document verification"],
      languages: ["English", "Hindi"]
    },
    {
      name: "Mental Health Support",
      number: "1800-599-0019",
      type: "24/7 Crisis Line",
      services: ["Counseling", "Crisis intervention", "Emotional support"],
      languages: ["English", "Hindi", "Regional"]
    },
    {
      name: "Legal Aid Helpline",
      number: "1800-345-4000",
      type: "Working Hours",
      services: ["Legal guidance", "Rights information", "Complaint filing"],
      languages: ["English", "Hindi"]
    }
  ];

  const supportCenters = [
    {
      name: "Mumbai Disability Resource Center",
      address: "Bandra Kurla Complex, Mumbai - 400051",
      phone: "+91-22-2659-4444",
      services: ["Counseling", "Assistive devices", "Job placement"],
      timings: "9:00 AM - 6:00 PM (Mon-Sat)"
    },
    {
      name: "Delhi PWD Support Center",
      address: "Connaught Place, New Delhi - 110001",
      phone: "+91-11-2334-5555",
      services: ["UDID registration", "Scheme guidance", "Medical support"],
      timings: "9:00 AM - 5:00 PM (Mon-Fri)"
    },
    {
      name: "Bangalore Inclusive Care Center",
      address: "MG Road, Bangalore - 560001",
      phone: "+91-80-2555-6666",
      services: ["Skill development", "Rehabilitation", "Family counseling"],
      timings: "8:00 AM - 7:00 PM (Mon-Sat)"
    }
  ];

  const emergencyServices = [
    {
      service: "Medical Emergency",
      number: "102",
      description: "Ambulance and medical emergency services"
    },
    {
      service: "Police Emergency",
      number: "100", 
      description: "Police assistance and emergency response"
    },
    {
      service: "Fire Emergency",
      number: "101",
      description: "Fire department and rescue services"
    },
    {
      service: "Women Helpline",
      number: "1091",
      description: "Women in distress and safety support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<Phone className="w-12 h-12" style={{ color: "hsl(174 72% 30%)" }} />}
          iconColor="hsl(174 72% 30%)"
          iconBg="hsl(174 72% 90%)"
          title="Helplines & Support"
          subtitle="24/7 helplines, counseling services, and emergency support contacts for immediate assistance"
          badge="Support Services"
        />

        <section className="py-10 page-3d-bg">
          <div className="container mx-auto px-4">
            {/* Back Navigation */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            {/* Emergency Alert */}
            <Card className="mb-8 border-red-200 shimmer-card card-3d"
              style={{ background: "hsl(0 84% 97%)" }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Emergency Situations</div>
                    <div className="text-sm">For immediate medical or safety emergencies, call emergency services directly.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="helplines" className="mb-8">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="helplines">Helplines</TabsTrigger>
                <TabsTrigger value="centers">Support Centers</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="online">Online Support</TabsTrigger>
              </TabsList>

              {/* Helplines Tab */}
              <TabsContent value="helplines" className="space-y-6">
                <div className="grid gap-6">
                  {helplines.map((helpline, index) => (
                    <div key={index} className="rounded-xl border border-border/60 bg-card shimmer-card gradient-border overflow-hidden"
                      style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px hsl(174 72% 30% / 0.2)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                              <Headphones className="w-5 h-5 text-teal-600" />
                              {helpline.name}
                            </h3>
                            <Badge variant="secondary">{helpline.type}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{helpline.number}</div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Services Provided</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {helpline.services.map((service, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                  {service}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Languages</h4>
                            <div className="flex gap-2 flex-wrap">
                              {helpline.languages.map((lang, idx) => (
                                <Badge key={idx} variant="outline">{lang}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button className="flex-1">
                            <Phone className="w-4 h-4 mr-2" />Call Now
                          </Button>
                          <Button variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Support Centers Tab */}
              <TabsContent value="centers" className="space-y-6">
                <div className="grid gap-6">
                  {supportCenters.map((center, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 shimmer-card">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          {center.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                              <div>
                                <div className="font-semibold text-sm">Address</div>
                                <div className="text-muted-foreground text-sm">{center.address}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-semibold text-sm">Phone</div>
                                <div className="text-muted-foreground text-sm">{center.phone}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-semibold text-sm">Timings</div>
                                <div className="text-muted-foreground text-sm">{center.timings}</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Services Available</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {center.services.map((service, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                                  {service}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button><MapPin className="w-4 h-4 mr-2" />Get Directions</Button>
                          <Button variant="outline"><Phone className="w-4 h-4 mr-2" />Call Center</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Emergency Services Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {emergencyServices.map((service, index) => (
                    <div key={index}
                      className="rounded-xl border border-red-200 bg-red-50/50 p-6 shimmer-card"
                      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.01)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px hsl(0 84% 60% / 0.2)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-red-800">{service.service}</h3>
                          <p className="text-sm text-red-600">{service.description}</p>
                        </div>
                        <div className="text-3xl font-bold text-red-600">{service.number}</div>
                      </div>
                      <Button variant="destructive" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />Call {service.number}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Online Support Tab */}
              <TabsContent value="online" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { icon: <MessageCircle className="w-5 h-5 text-blue-600" />, title: "Live Chat Support", desc: "Get instant help through our live chat feature available 24/7", action: "Start Chat", variant: "default" as const },
                    { icon: <Mail className="w-5 h-5 text-green-600" />, title: "Email Support", desc: "Send detailed queries and get responses within 24 hours", action: "Send Email", variant: "outline" as const },
                    { icon: <Users className="w-5 h-5 text-purple-600" />, title: "Community Forum", desc: "Connect with peers and share experiences in our community", action: "Join Community", variant: "outline" as const },
                    { icon: <Heart className="w-5 h-5 text-pink-600" />, title: "Peer Counseling", desc: "Book one-on-one sessions with trained peer counselors", action: "Book Session", variant: "outline" as const },
                  ].map((item, idx) => (
                    <Card key={idx} className="shimmer-card gradient-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">{item.icon}{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{item.desc}</p>
                        <Button variant={item.variant} className="w-full">{item.action}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Contact CTA */}
            <div
              className="rounded-2xl p-8 text-center shimmer-card"
              style={{ background: "linear-gradient(135deg, hsl(174 72% 95%), hsl(213 100% 97%))", border: "1px solid hsl(174 72% 70%)" }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: "hsl(174 72% 25%)" }}>Need Immediate Help?</h3>
              <p className="mb-6" style={{ color: "hsl(174 72% 30%)" }}>
                Our support team is available 24/7 to assist you with any queries or emergencies
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg"><Phone className="w-5 h-5 mr-2" />Call 1800-233-4444</Button>
                <Button variant="outline" size="lg"><MessageCircle className="w-5 h-5 mr-2" />Start Live Chat</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Support;