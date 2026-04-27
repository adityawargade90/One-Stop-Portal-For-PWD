import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/integrations/firebase";

const DISABILITY_TYPES = [
  { value: "visual",       label: "Visual Impairment" },
  { value: "hearing",      label: "Hearing Impairment" },
  { value: "physical",     label: "Physical/Locomotor Disability" },
  { value: "intellectual", label: "Intellectual Disability" },
  { value: "speech",       label: "Speech & Language Disability" },
  { value: "autism",       label: "Autism Spectrum Disorder" },
  { value: "multiple",     label: "Multiple Disabilities" },
  { value: "other",        label: "Other" },
];

const EDUCATION_LEVELS = [
  { value: "below_10th",    label: "Below 10th" },
  { value: "10th",          label: "10th (SSC/SSLC)" },
  { value: "12th",          label: "12th (HSC/Intermediate)" },
  { value: "diploma",       label: "Diploma" },
  { value: "graduate",      label: "Graduate (B.A/B.Sc/B.Com/B.Tech)" },
  { value: "postgraduate",  label: "Post Graduate (M.A/M.Sc/MBA)" },
  { value: "phd",           label: "PhD / Doctorate" },
];

const ProfileSetup = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [disabilityType,       setDisabilityType]       = useState("");
  const [disabilityPercentage, setDisabilityPercentage] = useState<number | "">("");
  const [educationLevel,       setEducationLevel]       = useState("");
  const [employmentStatus,     setEmploymentStatus]     = useState("");
  const [state,                setState]                = useState("");
  const [district,             setDistrict]             = useState("");
  const [loading,              setLoading]              = useState(false);
  const [error,                setError]                = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!disabilityType || !educationLevel || !state) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!user) {
      setError("You must be logged in to complete profile setup.");
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile(user.uid, {
        disabilityType,
        disabilityPercentage: Number(disabilityPercentage) || 0,
        educationLevel,
        employmentStatus,
        state,
        district,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("ProfileSetup error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg border border-border/60 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us a bit about yourself so we can personalise your experience.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Disability Type */}
          <div>
            <Label htmlFor="disability-type">Disability Type <span className="text-destructive">*</span></Label>
            <select
              id="disability-type"
              value={disabilityType}
              onChange={(e) => setDisabilityType(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Disability Type</option>
              {DISABILITY_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Disability Percentage */}
          <div>
            <Label htmlFor="disability-pct">Disability Percentage (if certified)</Label>
            <Input
              id="disability-pct"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 40"
              value={disabilityPercentage}
              onChange={(e) => setDisabilityPercentage(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Education Level */}
          <div>
            <Label htmlFor="education-level">Education Level <span className="text-destructive">*</span></Label>
            <select
              id="education-level"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Education Level</option>
              {EDUCATION_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <Label htmlFor="employment-status">Employment Status</Label>
            <select
              id="employment-status"
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Employment Status</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="self_employed">Self-employed</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* State */}
          <div>
            <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
            <Input
              id="state"
              placeholder="e.g. Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* District */}
          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              placeholder="e.g. Pune"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

