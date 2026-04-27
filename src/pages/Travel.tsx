import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Percent, 
  FileText, 
  ArrowLeft,
  ExternalLink,
  MapPin,
  CreditCard,
  Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";

const Travel = () => {
  const navigate = useNavigate();

  const railwayConcessions = [
    {
      category: "Blind Person",
      discount: "75%",
      companion: "One escort: 75% discount",
      classes: "All classes",
      conditions: "Valid disability certificate required"
    },
    {
      category: "Orthopedically Handicapped", 
      discount: "50%",
      companion: "One escort: 50% discount", 
      classes: "All classes",
      conditions: "Valid disability certificate required"
    },
    {
      category: "Mental Retardation",
      discount: "75%",
      companion: "One escort: 75% discount",
      classes: "All classes", 
      conditions: "Valid disability certificate required"
    },
    {
      category: "Cancer Patients",
      discount: "75%",
      companion: "One escort: 75% discount",
      classes: "All classes",
      conditions: "Valid medical certificate required"
    }
  ];

  const airlineConcessions = [
    {
      airline: "Air India",
      discount: "50%",
      eligibility: "PWDs with valid certificate",
      services: ["Priority boarding", "Wheelchair assistance", "Special meals"],
      booking: "Call customer service or online"
    },
    {
      airline: "IndiGo",
      discount: "Up to 50%", 
      eligibility: "PWDs and senior citizens",
      services: ["Assistance at airport", "Priority check-in", "Medical equipment"],
      booking: "Online with medical certificate"
    },
    {
      airline: "SpiceJet",
      discount: "50%",
      eligibility: "Certified disabled passengers",
      services: ["Special assistance", "Medical equipment", "Companion discounts"],
      booking: "Customer service or travel agent"
    }
  ];

  const busConcessions = [
    {
      operator: "State Road Transport",
      discount: "25-50%",
      coverage: "All state buses",
      eligibility: "Valid disability certificate",
      features: ["Reserved seats", "Easy boarding", "Attendant assistance"]
    },
    {
      operator: "Private Operators", 
      discount: "Varies",
      coverage: "Selected routes",
      eligibility: "Case by case basis",
      features: ["Wheelchair accessible", "Special booking", "Medical support"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<Plane className="w-12 h-12" style={{ color: "hsl(25 95% 40%)" }} />}
          iconColor="hsl(25 95% 40%)"
          iconBg="hsl(25 95% 93%)"
          title="Travel Concessions"
          subtitle="Railway, airline, and public transport concessions and booking assistance for persons with disabilities"
          badge="Transport Benefits"
        />

        <section className="py-10 page-3d-bg">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <Tabs defaultValue="railway" className="mb-8">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="railway">Railway</TabsTrigger>
                <TabsTrigger value="airline">Airlines</TabsTrigger>
                <TabsTrigger value="bus">Bus Transport</TabsTrigger>
                <TabsTrigger value="booking">How to Book</TabsTrigger>
              </TabsList>

              {/* Railway Concessions Tab */}
              <TabsContent value="railway" className="space-y-6">
                <Card className="border-blue-200 shimmer-card" style={{ background: "hsl(213 100% 97%)" }}>
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Train className="w-5 h-5" />
                      Indian Railway Concessions for PWDs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700">
                      Indian Railways provides significant discounts to persons with disabilities and their companions across all classes and trains.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {railwayConcessions.map((concession, index) => (
                    <div key={index}
                      className="rounded-xl border border-border/60 bg-card shimmer-card gradient-border overflow-hidden"
                      style={{ transition: "transform 0.2s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(6px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold">{concession.category}</h3>
                            <Badge variant="secondary">{concession.classes}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary flex items-center gap-1">
                              <Percent className="w-5 h-5" />{concession.discount.replace('%', '')}
                            </div>
                            <div className="text-xs text-muted-foreground">Discount</div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div><span className="font-medium text-foreground">Companion: </span>{concession.companion}</div>
                          <div><span className="font-medium text-foreground">Conditions: </span>{concession.conditions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-6 border border-green-200 shimmer-card" style={{ background: "hsl(142 76% 97%)" }}>
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Railway Booking Options</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button className="justify-start"><ExternalLink className="w-4 h-4 mr-2" />IRCTC Online Booking</Button>
                    <Button variant="outline" className="justify-start"><Phone className="w-4 h-4 mr-2" />Call 139 (Railway Enquiry)</Button>
                    <Button variant="outline" className="justify-start"><MapPin className="w-4 h-4 mr-2" />Visit Railway Station</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Airlines Tab */}
              <TabsContent value="airline" className="space-y-6">
                <div className="grid gap-6">
                  {airlineConcessions.map((airline, index) => (
                    <div key={index}
                      className="rounded-xl border border-border/60 bg-card shimmer-card gradient-border overflow-hidden"
                      style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px hsl(25 95% 40% / 0.15)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = "";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <Plane className="w-5 h-5 text-blue-600" />{airline.airline}
                            </h3>
                            <Badge variant="outline" className="mt-2">Commercial Airlines</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{airline.discount}</div>
                            <div className="text-xs text-muted-foreground">Discount</div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm">
                          <div><span className="font-semibold">Eligibility: </span><span className="text-muted-foreground">{airline.eligibility}</span></div>
                          <div><span className="font-semibold">Booking: </span><span className="text-muted-foreground">{airline.booking}</span></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {airline.services.map((s, idx) => <Badge key={idx} variant="secondary">{s}</Badge>)}
                        </div>
                        <Button className="w-full">Book Flight <ExternalLink className="w-4 h-4 ml-2" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Bus Transport Tab */}
              <TabsContent value="bus" className="space-y-6">
                <div className="grid gap-6">
                  {busConcessions.map((bus, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 shimmer-card">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Bus className="w-5 h-5 text-green-600" />{bus.operator}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div><h4 className="font-semibold mb-1">Discount</h4><p className="text-muted-foreground">{bus.discount}</p></div>
                          <div><h4 className="font-semibold mb-1">Coverage</h4><p className="text-muted-foreground">{bus.coverage}</p></div>
                          <div><h4 className="font-semibold mb-1">Eligibility</h4><p className="text-muted-foreground">{bus.eligibility}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bus.features.map((f, idx) => <Badge key={idx} variant="outline">{f}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* How to Book Tab */}
              <TabsContent value="booking" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shimmer-card gradient-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {[
                        ["Disability Certificate", "Valid certificate from competent authority"],
                        ["Identity Proof", "Aadhaar, PAN card, or passport"],
                        ["Medical Certificate (if required)", "For specific medical conditions"],
                      ].map(([title, desc], idx) => (
                        <div key={idx} className="flex items-start gap-2 mb-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <div className="font-semibold text-sm">{title}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="shimmer-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />Booking Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {["Choose Platform", "Enter Details", "Upload Documents", "Confirm & Pay"].map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 mb-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</div>
                          <div className="font-semibold text-sm">{step}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-xl p-6 border border-orange-200 shimmer-card" style={{ background: "hsl(25 95% 97%)" }}>
                  <h3 className="text-lg font-semibold mb-4 text-orange-800">Quick Booking Links</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Button className="justify-start"><Train className="w-4 h-4 mr-2" />IRCTC Railways</Button>
                    <Button variant="outline" className="justify-start"><Plane className="w-4 h-4 mr-2" />MakeMyTrip</Button>
                    <Button variant="outline" className="justify-start"><Bus className="w-4 h-4 mr-2" />RedBus</Button>
                    <Button variant="outline" className="justify-start"><Car className="w-4 h-4 mr-2" />Ola/Uber</Button>
                  </div>
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

export default Travel;