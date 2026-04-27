import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const SearchSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedDisability, setSelectedDisability] = useState("");

  const states = [
    "All States", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", 
    "Rajasthan", "Uttar Pradesh", "West Bengal", "Madhya Pradesh", "Others"
  ];

  const ageGroups = [
    "All Ages", "0-18 years", "18-25 years", "25-40 years", "40-60 years", "60+ years"
  ];

  const disabilityTypes = [
    "All Types", "Physical Disability", "Visual Impairment", "Hearing Impairment", 
    "Speech & Language Disability", "Intellectual Disability", "Mental Illness", 
    "Multiple Disabilities", "Others"
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedState) params.set('state', selectedState);
    if (selectedAge) params.set('age', selectedAge);
    if (selectedDisability) params.set('disability', selectedDisability);
    
    navigate(`/search-results?${params.toString()}`);
  };

  const handleAdvancedFilter = () => {
    // TODO: Implement advanced filter modal
    console.log("Advanced filter clicked");
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find What You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Search for schemes, scholarships, jobs, and support services
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
        />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="py-6 rounded-xl border-2">
                    <SelectValue placeholder={t("search.state")} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Age Group</label>
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger className="py-6 rounded-xl border-2">
                    <SelectValue placeholder={t("search.age")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((age) => (
                      <SelectItem key={age} value={age.toLowerCase().replace(/\s+/g, '-')}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Disability Type</label>
                <Select value={selectedDisability} onValueChange={setSelectedDisability}>
                  <SelectTrigger className="py-6 rounded-xl border-2">
                    <SelectValue placeholder={t("search.disability_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {disabilityTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="flex-1 py-6 text-lg rounded-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                {t("search.resources")}
              </Button>
              <Button 
                onClick={handleAdvancedFilter}
                variant="outline" 
                size="lg" 
                className="sm:w-auto py-6 px-8 text-lg rounded-xl"
              >
                <Filter className="w-5 h-5 mr-2" />
                {t("search.advanced_filter")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;