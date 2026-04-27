import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale,
  FileText,
  Shield,
  Gavel,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RulesRegulationsSection = () => {
  const { toast } = useToast();

  const handleDownload = (fileUrl: string) => {
    if (!fileUrl) return;
    toast({
      title: "Download Started",
      description: `Downloading document`,
    });
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() ?? "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewOnline = (fileUrl: string) => {
    if (!fileUrl) return;
    toast({
      title: "Opening Document",
      description: `Opening document in a new tab`,
    });
    window.open(fileUrl, "_blank");
  };

  const handleQuickLink = (url: string) => {
  toast({
    title: "Redirecting",
    description: `Opening document`,
  });
  // Open the PDF or resource in a new tab
  window.open(url, "_blank");
};

  const handleFileComplaint = () => {
    toast({
      title: "Complaint System",
      description: "Redirecting to the grievance portal",
    });
    window.open('https://www.disabilitycomplaints.gov.in', '_blank');
  };

  const regulations = [
    {
      icon: Scale,
      title: "Rights of Persons with Disabilities Act, 2016",
      description: "Comprehensive law ensuring equal rights and full participation",
      type: "Central Act",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      downloadUrl: "/documents/DisabilitiesActs.pdf",
      viewUrl: "/documents/DisabilitiesActs.pdf"
    },
    {
      icon: FileText,
      title: "Accessibility Standards",
      description: "Guidelines for barrier-free environments and universal design",
      type: "Standards",
      color: "text-green-600",
      bgColor: "bg-green-50",
      downloadUrl: "/documents/GuidelinesIndia.pdf",
      viewUrl: "/documents/GuidelinesIndia.pdf"
    },
    {
      icon: Shield,
      title: "Reservation Policies",
      description: "Employment and education reservation rules for PWDs",
      type: "Policy",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      downloadUrl: "/documents/Reservation_Policies.pdf",
      viewUrl: "/documents/Reservation_Policies.pdf"
    },
    {
      icon: Gavel,
      title: "Court Judgments & Orders",
      description: "Important legal precedents and court decisions shaping disability rights",
      type: "Legal",
      color: "text-red-600",
      bgColor: "bg-red-50",
      documents: [
        {
          name: "Rajive Raturi v. Union of India (2005)",
          summary: "Landmark PIL addressing accessibility in public spaces, transport, and education enforcing fundamental rights for visually impaired.",
          link: "https://indiankanoon.org/doc/149818296/"
        },
        {
          name: "Vikash Kumar v. UPSC (2021)",
          summary: "Clarified the scope of ‘reasonable accommodation’ under RPwD Act denying scribe facility to non-benchmark disability candidate was discriminatory.",
          link: "https://www.scobserver.in/journal/seven-judgements-on-disability-rights-authored-by-d-y-chandrachud/"
        },
        {
          name: "Reena Banerjee v. Gov of NCT (2025)",
          summary: "Reinforced candidates’ right to merit upward movement in public recruitment preventing hostile discrimination.",
          link: "https://www.disabilityrightsindia.com/index.html"
        },
        {
          name: "SC Directive on Accessibility Rules Revision (2024)",
          summary: "Compelled revision of discretionary accessibility rules to mandatory, stressing universal design and strict RPwD Act enforcement.",
          link: "https://www.scobserver.in/journal/seven-judgements-on-disability-rights-authored-by-d-y-chandrachud/"
        },
        {
          name: "Project Ability Empowerment",
          summary: "Nationwide independent monitoring framework to ensure quality care and inclusive living for persons with cognitive disabilities.",
          link: "https://www.disabilityrightsindia.com/2025/"
        }
      ]
    }
  ];

  const quickLinks = [
  {
    title: "Disability Certificate Process",
    url: "/documents/DisabilityCertificate.pdf"
  },
  {
    title: "UDID Card Application",
    url: "/documents/DisabilityCertificate.pdf"
  },
  {
    title: "Grievance Redressal Mechanism",
    url: "/documents/Grievance Redressal Mechanism.pdf"
  },
  {
    title: "State-wise Implementation Guidelines",
    url: "/documents/State Wise Implementation Guidance.pdf"
  }
];


  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rules & Regulations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed about laws, policies, and regulations that protect and empower persons with disabilities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Main Regulations */}
          <div className="grid gap-6">
            {regulations.map((regulation, index) => {
              const Icon = regulation.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${regulation.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${regulation.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {regulation.title}
                          </CardTitle>
                          <span className={`px-2 py-1 text-xs rounded-full ${regulation.bgColor} ${regulation.color} font-medium`}>
                            {regulation.type}
                          </span>
                        </div>
                        <CardDescription className="text-muted-foreground text-sm">
                          {regulation.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {regulation.title === "Court Judgments & Orders" && regulation.documents ? (
                      <ul className="mb-6 space-y-4 list-disc list-inside text-sm text-muted-foreground">
                        {regulation.documents.map((doc, i) => (
                          <li key={i}>
                            <a 
                              href={doc.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:underline font-semibold"
                            >
                              {doc.name}
                            </a> - {doc.summary}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDownload(regulation.downloadUrl)} 
                          variant="outline" 
                          size="sm"
                          className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                          disabled={!regulation.downloadUrl}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button 
                          onClick={() => handleViewOnline(regulation.viewUrl)} 
                          variant="ghost" 
                          size="sm"
                          className="flex-1"
                          disabled={!regulation.viewUrl}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Online
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Quick Access
                </CardTitle>
                <CardDescription>
                  Frequently accessed documents and processes
                </CardDescription>
              </CardHeader>
             <CardContent className="space-y-3">
  {quickLinks.map((link, index) => (
    <Button
      key={index}
      onClick={() => handleQuickLink(link.url)}
      variant="ghost"
      className="w-full justify-start text-left hover:bg-primary/10"
    >
      <ExternalLink className="w-4 h-4 mr-3 text-primary" />
      {link.title}
    </Button>
  ))}
</CardContent>

            </Card>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Know Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Every person with disability has the right to equality, dignity, and full participation in society.
                </p>
                <Button 
                  onClick={() => window.open('https://www.disabilitycomplaints.gov.in', '_blank')}
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                >
                  File a Complaint
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesRegulationsSection;
