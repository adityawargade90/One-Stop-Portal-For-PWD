import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  FileText, 
  MapPin, 
  Phone, 
  Clock, 
  ArrowLeft,
  Download,
  ExternalLink,
  Stethoscope,
  CreditCard,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";

const Health = () => {
  const navigate = useNavigate();

  const healthServices = [
    {
      name: "All India Institute of Medical Sciences (AIIMS)",
      location: "New Delhi",
      specialties: ["Rehabilitation Medicine", "Prosthetics & Orthotics", "Mental Health"],
      contact: "+91-11-2659-8700",
      facilities: ["Accessible infrastructure", "Sign language interpreters", "Braille materials"],
      rating: 4.8
    },
    {
      name: "KEM Hospital",
      location: "Mumbai, Maharashtra", 
      specialties: ["Physical Medicine", "Occupational Therapy", "Speech Therapy"],
      contact: "+91-22-2417-7000",
      facilities: ["Wheelchair accessibility", "Special parking", "Trained staff"],
      rating: 4.6
    },
    {
      name: "Christian Medical College",
      location: "Vellore, Tamil Nadu",
      specialties: ["Rehabilitation", "Assistive Technology", "Psychological Support"],
      contact: "+91-416-228-1000",
      facilities: ["Multi-disciplinary care", "Subsidized treatment", "Research facilities"],
      rating: 4.9
    }
  ];

  const udidSteps = [
    {
      step: 1,
      title: "Online Application",
      description: "Fill the UDID application form on the official portal",
      documents: ["Disability certificate", "Identity proof", "Address proof", "Recent photograph"]
    },
    {
      step: 2,
      title: "Document Verification",
      description: "Submit required documents for verification",
      documents: ["Medical certificate from authorized doctor", "Income certificate (if applicable)"]
    },
    {
      step: 3,
      title: "Medical Assessment",
      description: "Attend medical assessment at designated center",
      documents: ["All medical reports", "Previous disability certificates"]
    },
    {
      step: 4,
      title: "Card Issuance",
      description: "Receive UDID card within 30 days of approval",
      documents: ["Acknowledgment receipt", "SMS/Email confirmation"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<Heart className="w-12 h-12" style={{ color: "hsl(0 84% 45%)" }} />}
          iconColor="hsl(0 84% 45%)"
          iconBg="hsl(0 84% 95%)"
          title="Health & UDID"
          subtitle="Healthcare services, UDID registration, and medical support resources for persons with disabilities"
          badge="Medical Services"
        />

        <section className="py-10 page-3d-bg">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <Tabs defaultValue="healthcare" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="healthcare">Healthcare Services</TabsTrigger>
                <TabsTrigger value="udid">UDID Registration</TabsTrigger>
                <TabsTrigger value="resources">Medical Resources</TabsTrigger>
              </TabsList>

              {/* Healthcare Services Tab */}
              <TabsContent value="healthcare" className="space-y-6">
                <div className="grid gap-6">
                  {healthServices.map((service, index) => (
                    <div key={index}
                      className="rounded-xl border border-border/60 bg-card shimmer-card gradient-border overflow-hidden"
                      style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 36px hsl(0 84% 45% / 0.15)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                              <Stethoscope className="w-5 h-5 text-red-600" />
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">{service.location}</span>
                              <Badge variant="outline">Rating: {service.rating}/5</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Specialties</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {service.specialties.map((s, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Accessibility Features</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {service.facilities.map((f, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button><Phone className="w-4 h-4 mr-2" />Call Hospital</Button>
                          <Button variant="outline"><MapPin className="w-4 h-4 mr-2" />Get Directions</Button>
                          <Button variant="outline">Book Appointment</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* UDID Registration Tab */}
              <TabsContent value="udid" className="space-y-6">
                <Card className="border-blue-200 shimmer-card" style={{ background: "hsl(213 100% 97%)" }}>
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      What is UDID Card?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 mb-4">
                      The Unique Disability Identity (UDID) card is a government initiative to create a national database of persons with disabilities.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-800">Benefits:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Single identity document</li><li>• Access to government schemes</li>
                          <li>• Tracking of benefits utilization</li><li>• Transparency in service delivery</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-800">Features:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Unique 18-digit ID number</li><li>• Multiple color-coded categories</li>
                          <li>• QR code for verification</li><li>• Linked with Aadhaar</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-center">UDID Registration Process</h3>
                  {udidSteps.map((stepInfo, index) => (
                    <div key={index}
                      className="rounded-xl border border-border/60 bg-card p-6 shimmer-card gradient-border"
                      style={{ transition: "transform 0.2s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          {stepInfo.step}
                        </div>
                        <h4 className="text-lg font-semibold">{stepInfo.title}</h4>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{stepInfo.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {stepInfo.documents.map((doc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                            <FileText className="w-3 h-3" />{doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <Button className="w-full"><ExternalLink className="w-4 h-4 mr-2" />Apply for UDID</Button>
                  <Button variant="outline" className="w-full"><FileText className="w-4 h-4 mr-2" />Check Status</Button>
                  <Button variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />Download Forms</Button>
                </div>
              </TabsContent>

              {/* Medical Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shimmer-card gradient-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-green-600" />
                        Government Health Schemes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {[
                          ["Pradhan Mantri Jan Arogya Yojana", "Free healthcare up to ₹5 lakh per family"],
                          ["Deendayal Disabled Rehabilitation Scheme", "Support for rehabilitation centers"],
                          ["Assistive Devices Distribution", "Free assistive devices and equipment"],
                        ].map(([title, desc], idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                            <div>
                              <div className="font-semibold text-sm">{title}</div>
                              <div className="text-sm text-muted-foreground">{desc}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4">Learn More</Button>
                    </CardContent>
                  </Card>

                  <Card className="shimmer-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-600" />
                        Emergency Medical Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          ["Medical Emergency", "Ambulance Services", "102"],
                          ["Mental Health Helpline", "Crisis Support", "1800-599-0019"],
                          ["Disability Helpline", "General Support", "1800-233-4444"],
                        ].map(([name, desc, num], idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="font-semibold text-sm">{name}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                            <Button variant="outline" size="sm">{num}</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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

export default Health;