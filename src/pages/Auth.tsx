import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  ArrowLeft 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  registerWithEmail,
  signInWithEmail,
  createUserProfile,
  getUserProfile,
} from "@/integrations/firebase";

const Auth = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ========================
  // LOGIN FUNCTION
  // ========================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmail(email, password);
      const uid = credential.user.uid;

      // Check if user has completed profile setup
      const profile = await getUserProfile(uid);
      if (!profile?.profileCompleted) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // REGISTER FUNCTION
  // ========================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const credential = await registerWithEmail(fullName, email, password);
      const uid = credential.user.uid;

      // Create initial Firestore profile document
      await createUserProfile(uid, {
        uid,
        fullName,
        email,
        disabilityType: "",
        disabilityPercentage: 0,
        educationLevel: "",
        employmentStatus: "",
        state: "",
        district: "",
        profileCompleted: false,
      });

      navigate("/profile-setup");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* 3D animated background */}
      <main className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-15 animate-float"
            style={{ background: "radial-gradient(circle, hsl(213 100% 55%), transparent 70%)" }} />
          <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full opacity-10 animate-float-slow"
            style={{ background: "radial-gradient(circle, hsl(142 76% 40%), transparent 70%)" }} />
          <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full opacity-10 animate-float-delayed"
            style={{ background: "radial-gradient(circle, hsl(43 96% 55%), transparent 70%)" }} />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 animate-slide-in-up">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-glow shimmer-card"
                style={{ background: "hsl(213 100% 95%)", border: "1px solid hsl(213 100% 75%)" }}
              >
                <Accessibility className="w-12 h-12 text-primary" />
              </div>
              <h1
                className="text-3xl font-bold mb-2 animate-gradient-bg"
                style={{
                  background: "linear-gradient(135deg, hsl(213 100% 35%), hsl(213 100% 55%), hsl(142 76% 36%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                }}
              >
                Welcome to PWD Portal
              </h1>
              <p className="text-muted-foreground">
                Access your personalized dashboard and services
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <div
              className="card-3d shimmer-card rounded-2xl overflow-hidden shadow-xl border border-primary/15"
              style={{
                background: "hsl(0 0% 100% / 0.9)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Tabs defaultValue="signin" className="space-y-0">
                <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-2xl">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* SIGN IN */}
                <TabsContent value="signin" className="p-6 animate-slide-in-up">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-foreground">Sign In</h2>
                    <p className="text-sm text-muted-foreground">Enter your credentials</p>
                  </div>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full shimmer-card"
                      disabled={loading}
                      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px hsl(213 100% 40% / 0.35)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                      }}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGN UP */}
                <TabsContent value="signup" className="p-6 animate-slide-in-up">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-foreground">Create Account</h2>
                    <p className="text-sm text-muted-foreground">Register to access all features</p>
                  </div>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full shimmer-card"
                      disabled={loading}
                      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "";
                      }}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      A verification email will be sent to your address.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ─── Error message helper ──────────────────────────────────────────────────────

function getFriendlyErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use":     "An account with this email already exists.",
    "auth/invalid-email":            "Please enter a valid email address.",
    "auth/weak-password":            "Password must be at least 6 characters.",
    "auth/user-not-found":           "No account found with this email.",
    "auth/wrong-password":           "Incorrect password. Please try again.",
    "auth/invalid-credential":       "Invalid email or password. Please try again.",
    "auth/too-many-requests":        "Too many attempts. Please try again later.",
    "auth/network-request-failed":   "Network error. Check your connection and retry.",
  };
  return messages[code] ?? "An unexpected error occurred. Please try again.";
}

export default Auth;
