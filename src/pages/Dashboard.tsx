import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, type UserProfile } from "@/integrations/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, GraduationCap, Briefcase, LogOut, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate          = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [profile, setProfile]           = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    // Wait until the auth state has resolved
    if (authLoading) return;

    // Redirect to auth if not logged in
    if (!user) {
      navigate("/auth");
      return;
    }

    const load = async () => {
      try {
        setProfileLoading(true);
        const data = await getUserProfile(user.uid);
        setProfile(data);
        // If the user hasn't completed their profile, redirect them
        if (!data?.profileCompleted) {
          navigate("/profile-setup");
        }
      } catch (err) {
        console.error("Dashboard: failed to load profile", err);
        setError("Could not load your profile. Please try again.");
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // ── Loading states ──────────────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Greeting row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile.fullName || user?.displayName || "User"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/profile-setup")}
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Profile cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {/* Disability */}
          <Card className="shimmer-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Disability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">
                {profile.disabilityType || "—"}
              </div>
              {profile.disabilityPercentage > 0 && (
                <Badge variant="secondary" className="mt-1">
                  {profile.disabilityPercentage}% certified
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="shimmer-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">
                {profile.educationLevel?.replace(/_/g, " ") || "—"}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shimmer-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {[profile.district, profile.state].filter(Boolean).join(", ") || "—"}
              </div>
            </CardContent>
          </Card>

          {/* Employment */}
          <Card className="shimmer-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">
                {profile.employmentStatus?.replace(/_/g, " ") || "—"}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="shimmer-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={profile.profileCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                {profile.profileCompleted ? "✓ Complete" : "Incomplete"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Explore Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Schemes",      path: "/schemes" },
              { label: "Scholarships", path: "/scholarships" },
              { label: "Jobs",         path: "/jobs" },
              { label: "Health",       path: "/health" },
              { label: "Travel",       path: "/travel" },
              { label: "Support",      path: "/support" },
            ].map((link) => (
              <Button
                key={link.path}
                variant="outline"
                className="justify-start"
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

