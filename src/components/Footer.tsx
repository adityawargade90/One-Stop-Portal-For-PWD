import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone,
  Accessibility
} from "lucide-react";

const Footer = () => {
  const footerLinks = [
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
    { name: "Feedback", href: "#feedback" },
    { name: "Privacy Policy", href: "#privacy" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#facebook" },
    { name: "Twitter", icon: Twitter, href: "#twitter" },
    { name: "LinkedIn", icon: Linkedin, href: "#linkedin" },
  ];

  return (
    <footer className="relative overflow-hidden border-t">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10 animate-gradient-bg"
        style={{
          background: "linear-gradient(135deg, hsl(213 100% 97%), hsl(210 20% 96%) 50%, hsl(142 76% 97%))",
          backgroundSize: "200% 200%",
        }}
        aria-hidden="true"
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-12 left-1/4 w-40 h-40 rounded-full opacity-10 animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(213 100% 50%), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-32 h-32 rounded-full opacity-10 animate-float-delayed"
          style={{ background: "radial-gradient(circle, hsl(142 76% 40%), transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center animate-glow"
                style={{ transition: "transform 0.3s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "perspective(400px) rotateY(20deg) scale(1.15)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}
              >
                <Accessibility className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">One-Stop Portal</h3>
                <p className="text-sm text-muted-foreground">for Persons with Disabilities</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering persons with disabilities through comprehensive access to schemes, 
              scholarships, employment opportunities, and support services.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>Helpline: 1800-XXX-XXXX (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@onestopportal.gov.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="relative text-muted-foreground hover:text-primary transition-colors focus-visible group inline-flex items-center gap-1"
                  >
                    <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary rounded transition-all duration-300 group-hover:w-full" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-10 h-10 shimmer-card"
                    style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px) scale(1.1)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px hsl(213 100% 40% / 0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                    }}
                  >
                    <a
                      href={social.href}
                      title={social.name}
                      className="flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
            
            {/* Emergency Contact */}
            <div
              className="mt-6 p-4 rounded-lg border card-3d shimmer-card"
              style={{
                background: "hsl(0 84% 97%)",
                borderColor: "hsl(0 84% 85%)",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "perspective(600px) rotateX(-5deg) translateZ(6px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
              }}
            >
              <h5 className="font-medium text-destructive mb-2">Emergency Support</h5>
              <p className="text-sm text-muted-foreground">
                For urgent assistance call: <br />
                <span className="font-semibold text-destructive">108 (Emergency)</span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© 2024 One-Stop Portal for Persons with Disabilities. All rights reserved.</p>
            <p className="mt-1">
              <span className="font-medium">Powered by Students for Inclusion</span> | 
              Built with accessibility in mind
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>WCAG 2.1 AA Compliant</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Multi-language Support</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Screen Reader Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;