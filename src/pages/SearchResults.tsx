import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Download, MapPin, Phone, Mail, Clock, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'scheme' | 'scholarship' | 'job' | 'support' | 'health' | 'education';
  category: string;
  location: string;
  eligibility: string[];
  benefits: string[];
  deadline?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  documents?: string[];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const state = searchParams.get('state') || '';
  const age = searchParams.get('age') || '';
  const disability = searchParams.get('disability') || '';

  useEffect(() => {
    // Simulate API call - in real implementation, this would call your backend
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'National Scholarship for Students with Disabilities',
        description: 'Financial assistance for students with disabilities pursuing higher education',
        type: 'scholarship',
        category: 'Education',
        location: 'All India',
        eligibility: ['Person with Disability Certificate', 'Annual family income below ₹8 lakhs', 'Pursuing graduation or post-graduation'],
        benefits: ['Up to ₹50,000 per year', 'Laptop/tablet allowance', 'Hostel fee coverage'],
        deadline: '2024-03-31',
        contact: {
          phone: '1800-11-1234',
          email: 'scholarship@gov.in',
          website: 'https://scholarships.gov.in'
        },
        documents: ['Disability Certificate', 'Income Certificate', 'Academic Transcripts']
      },
      {
        id: '2',
        title: 'Accessible India Campaign - Employment Initiative',
        description: 'Job placement program for persons with disabilities in government and private sectors',
        type: 'job',
        category: 'Employment',
        location: state || 'All States',
        eligibility: ['UDID Card holder', 'Age 18-40 years', 'Minimum qualification: Class 12'],
        benefits: ['Job placement assistance', 'Skill development training', 'Interview preparation'],
        contact: {
          phone: '1800-22-5678',
          email: 'employment@accessibleindia.gov.in'
        },
        documents: ['UDID Card', 'Educational Certificates', 'Resume']
      },
      {
        id: '3',
        title: 'Assistive Technology Support Scheme',
        description: 'Subsidized assistive devices and technology for daily living independence',
        type: 'support',
        category: 'Assistive Technology',
        location: 'All India',
        eligibility: ['Disability percentage above 40%', 'Annual income below ₹5 lakhs'],
        benefits: ['90% subsidy on assistive devices', 'Home delivery service', 'Training on device usage'],
        contact: {
          phone: '1800-33-9012',
          email: 'support@alimco.in'
        },
        documents: ['Disability Certificate', 'Income Proof', 'Medical Prescription']
      }
    ];

    // Filter results based on search parameters
    const filteredResults = mockResults.filter(result => {
      const matchesQuery = !query || result.title.toLowerCase().includes(query.toLowerCase()) || 
                          result.description.toLowerCase().includes(query.toLowerCase());
      const matchesState = !state || state === 'all-states' || result.location.includes(state);
      const matchesAge = !age || age === 'all-ages'; // Age filtering logic can be enhanced
      const matchesDisability = !disability || disability === 'all-types'; // Disability filtering logic can be enhanced
      
      return matchesQuery && matchesState && matchesAge && matchesDisability;
    });

    setTimeout(() => {
      setResults(filteredResults);
      setLoading(false);
    }, 1000);
  }, [query, state, age, disability]);

  const getTypeColor = (type: string) => {
    const colors = {
      scheme: 'bg-blue-100 text-blue-800',
      scholarship: 'bg-green-100 text-green-800',
      job: 'bg-purple-100 text-purple-800',
      support: 'bg-orange-100 text-orange-800',
      health: 'bg-red-100 text-red-800',
      education: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">Search Results</h1>
            {query && <p className="text-muted-foreground">Showing results for: "{query}"</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {state && state !== 'all-states' && (
                <Badge variant="outline">State: {state.replace(/-/g, ' ')}</Badge>
              )}
              {age && age !== 'all-ages' && (
                <Badge variant="outline">Age: {age.replace(/-/g, ' ')}</Badge>
              )}
              {disability && disability !== 'all-types' && (
                <Badge variant="outline">Type: {disability.replace(/-/g, ' ')}</Badge>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or explore other categories.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getTypeColor(result.type)}>
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </Badge>
                    {result.deadline && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {result.deadline}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {result.location}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Eligibility:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.eligibility.slice(0, 2).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                      {result.eligibility.length > 2 && (
                        <li className="text-xs text-primary">+{result.eligibility.length - 2} more criteria</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.benefits.slice(0, 2).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.contact && (
                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-sm mb-2">Contact:</h4>
                      <div className="space-y-1">
                        {result.contact.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2" />
                            {result.contact.phone}
                          </div>
                        )}
                        {result.contact.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2" />
                            {result.contact.email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;