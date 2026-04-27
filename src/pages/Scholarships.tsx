import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  IndianRupee,
  Calendar,
  Users,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero3D from "@/components/PageHero3D";


const Scholarships = () => {
  const navigate = useNavigate();

  const scholarships = [
    {
      id: 1,
      title: "National Scholarship for Students with Disabilities",
      provider: "Ministry of Education",
      amount: "₹2,000 - ₹12,000/year",
      level: "All Levels",
      deadline: "31st March 2024",
      eligibility: "40% disability, Merit based",
      description: "Merit-based scholarship for students with disabilities studying in recognized institutions",
      benefits: ["Tuition fees", "Maintenance allowance", "Books & Equipment"],
      applicationLink: "#"
    },
    {
      id: 2,
      title: "UGC Fellowship for PhD Students with Disabilities",
      provider: "University Grants Commission",
      amount: "₹31,000/month + Contingency",
      level: "PhD",
      deadline: "30th June 2024",
      eligibility: "40% disability, NET/JRF qualified",
      description: "Research fellowship for PhD students with disabilities in universities",
      benefits: ["Monthly fellowship", "Research grants", "Conference support"],
      applicationLink: "#"
    },
    {
      id: 3,
      title: "State Merit Scholarship for PWDs",
      provider: "State Government",
      amount: "₹5,000 - ₹20,000/year",
      level: "Undergraduate/Postgraduate",
      deadline: "15th August 2024",
      eligibility: "State domicile, 60% marks",
      description: "Merit scholarship for students with disabilities from state quota",
      benefits: ["Fee reimbursement", "Stipend", "Book allowance"],
      applicationLink: "#"
    },
    // School scholarships
    {
      id: 4,
      title: "Pre-Matric Scholarship for Students with Disabilities",
      provider: "Department of Empowerment of Persons with Disabilities (DEPwD)",
      amount: "₹500–₹800/month + Allowances",
      level: "School",
      deadline: "31st March 2024",
      eligibility:
        "Indian nationals with ≥40% disability studying in Class 9 or 10; family income ≤ ₹2.5 lakh/year; max two disabled children per family (except twins)",
      description:
        "Pre-Matric financial assistance for students with benchmark disabilities to encourage continued school education and reduce dropout.",
      benefits: [
        "Maintenance allowance (₹500–₹800/month)",
        "Book grant and disability allowance",
        "Additional allowance for assistive devices",
      ],
      applicationLink: "https://divyangkalyan.maharashtra.gov.in/scheme/1-pre-matric-scholarship-for-students-with-disabilities/",
    },
    {
      id: 5,
      title: "State-Level Scholarships for PWD School Students",
      provider: "State Education and Social Welfare Departments",
      amount: "₹3,000 – ₹10,000/year",
      level: "School",
      deadline: "Varies by state (e.g., 31st August 2024)",
      eligibility:
        "Students with 40% or more disability studying in Class 1–10 in recognized schools; domicile of the state; income and merit criteria applicable.",
      description:
        "Merit-based and need-based financial aid schemes for school students with disabilities administered by individual states to ensure inclusive education.",
      benefits: ["Tuition fee waiver", "Stipend or lump-sum grant", "Book and uniform allowance"],
      applicationLink: "#",
    },
    // New scholarship entries
    {
      id: 6,
      title: "Scholarship for Undergraduate Students with Disabilities",
      provider: "Ministry of Social Justice and Empowerment",
      amount: "₹10,000 - ₹50,000 per year",
      level: "Undergraduate",
      deadline: "31st August 2024",
      eligibility: "40% disability, enrolled in recognized undergraduate course",
      description:
        "Financial assistance for undergraduate students with disabilities pursuing higher education",
      benefits: ["Tuition fee coverage", "Hostel allowance", "Books & Equipment"],
      applicationLink: "#"
    },
    {
      id: 7,
      title: "Postgraduate Scholarship for Students with Disabilities",
      provider: "Department of Empowerment of Persons with Disabilities",
      amount: "₹15,000 - ₹60,000 per year",
      level: "Postgraduate",
      deadline: "30th September 2024",
      eligibility:
        "Students with disabilities with 40% or more disability enrolled in a recognized postgraduate course",
      description:
        "Scholarship to support postgraduate education for persons with disabilities",
      benefits: ["Tuition fees", "Research grants", "Monthly maintenance allowance"],
      applicationLink: "#"
    },
    {
      id: 8,
      title: "PhD Fellowship for Disabled Scholars",
      provider: "University Grants Commission",
      amount: "₹31,000/month + Contingency",
      level: "PhD",
      deadline: "30th June 2024",
      eligibility: "Minimum 40% disability, NET/JRF qualified PhD students",
      description:
        "Research fellowship supporting PhD level studies for students with disabilities",
      benefits: ["Monthly fellowship", "Conference support", "Research grants"],
      applicationLink: "#"
    },
    {
      id: 9,
      title: "Vocational Training Scholarship for Persons with Disabilities",
      provider: "National Handicapped Finance and Development Corporation (NHFDC)",
      amount: "₹5,000 - ₹25,000 per course",
      level: "Vocational",
      deadline: "31st July 2024",
      eligibility:
        "Persons with disabilities enrolled in recognized vocational training programs",
      description:
        "Scholarship to promote vocational skills and self-employment for disabled persons",
      benefits: ["Course fees", "Tools and equipment assistance", "Training stipend"],
      applicationLink: "#"
    }
  ];

  const levels = ["All", "School", "Undergraduate", "Postgraduate", "PhD", "Vocational"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 3D Hero */}
        <PageHero3D
          icon={<GraduationCap className="w-12 h-12" style={{ color: "hsl(142 76% 30%)" }} />}
          iconColor="hsl(142 76% 30%)"
          iconBg="hsl(142 76% 93%)"
          title="Scholarships"
          subtitle="Educational scholarships, grants, and funding opportunities for students with disabilities"
          badge="Education Funding"
        />

        <section className="py-8 page-3d-bg">
          <div className="container mx-auto px-4">
            {/* Back Navigation */}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">Active Scholarships</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <IndianRupee className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">₹50Cr+</div>
              <div className="text-sm text-muted-foreground">Total Funding</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">25,000+</div>
              <div className="text-sm text-muted-foreground">Beneficiaries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Institutions</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Education Levels */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            {levels.map((level) => (
              <TabsTrigger key={level} value={level.toLowerCase()}>
                {level}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ALL LEVELS TAB */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {scholarships.map((scholarship) => (
                <Card key={scholarship.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{scholarship.title}</CardTitle>
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <Badge variant="secondary">{scholarship.provider}</Badge>
                          <Badge variant="outline">{scholarship.level}</Badge>
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            Deadline: {scholarship.deadline}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {scholarship.amount}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {scholarship.description}
                    </CardDescription>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                        <p className="text-muted-foreground">{scholarship.eligibility}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Benefits Included</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {scholarship.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <a
                          href={scholarship.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apply for Scholarship
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                      <Button variant="outline">Download Form</Button>
                      <Button variant="outline">Get Guidelines</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SCHOOL LEVEL TAB */}
          <TabsContent value="school" className="space-y-6">
            <div className="grid gap-6">
              {scholarships
                .filter((scholarship) => scholarship.level.toLowerCase() === "school")
                .map((scholarship) => (
                  <Card
                    key={scholarship.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {scholarship.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{scholarship.provider}</Badge>
                            <Badge variant="outline">{scholarship.level}</Badge>
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Deadline: {scholarship.deadline}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {scholarship.amount}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {scholarship.description}
                      </CardDescription>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Eligibility Criteria
                          </h4>
                          <p className="text-muted-foreground">
                            {scholarship.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Benefits Included</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1">
                          <a
                            href={scholarship.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply for Scholarship
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline">Download Form</Button>
                        <Button variant="outline">Get Guidelines</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* UNDERGRADUATE LEVEL TAB */}
          <TabsContent value="undergraduate" className="space-y-6">
            <div className="grid gap-6">
              {scholarships
                .filter((s) => s.level.toLowerCase() === "undergraduate")
                .map((scholarship) => (
                  <Card
                    key={scholarship.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {scholarship.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{scholarship.provider}</Badge>
                            <Badge variant="outline">{scholarship.level}</Badge>
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Deadline: {scholarship.deadline}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {scholarship.amount}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {scholarship.description}
                      </CardDescription>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Eligibility Criteria
                          </h4>
                          <p className="text-muted-foreground">
                            {scholarship.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Benefits Included</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1">
                          <a
                            href={scholarship.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply for Scholarship
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline">Download Form</Button>
                        <Button variant="outline">Get Guidelines</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* POSTGRADUATE LEVEL TAB */}
          <TabsContent value="postgraduate" className="space-y-6">
            <div className="grid gap-6">
              {scholarships
                .filter((s) => s.level.toLowerCase() === "postgraduate")
                .map((scholarship) => (
                  <Card
                    key={scholarship.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {scholarship.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{scholarship.provider}</Badge>
                            <Badge variant="outline">{scholarship.level}</Badge>
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Deadline: {scholarship.deadline}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {scholarship.amount}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {scholarship.description}
                      </CardDescription>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Eligibility Criteria
                          </h4>
                          <p className="text-muted-foreground">
                            {scholarship.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Benefits Included</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1">
                          <a
                            href={scholarship.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply for Scholarship
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline">Download Form</Button>
                        <Button variant="outline">Get Guidelines</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* PHD LEVEL TAB */}
          <TabsContent value="phd" className="space-y-6">
            <div className="grid gap-6">
              {scholarships
                .filter((s) => s.level.toLowerCase() === "phd")
                .map((scholarship) => (
                  <Card
                    key={scholarship.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {scholarship.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{scholarship.provider}</Badge>
                            <Badge variant="outline">{scholarship.level}</Badge>
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Deadline: {scholarship.deadline}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {scholarship.amount}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {scholarship.description}
                      </CardDescription>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Eligibility Criteria
                          </h4>
                          <p className="text-muted-foreground">
                            {scholarship.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Benefits Included</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1">
                          <a
                            href={scholarship.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply for Scholarship
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline">Download Form</Button>
                        <Button variant="outline">Get Guidelines</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* VOCATIONAL LEVEL TAB */}
          <TabsContent value="vocational" className="space-y-6">
            <div className="grid gap-6">
              {scholarships
                .filter((s) => s.level.toLowerCase() === "vocational")
                .map((scholarship) => (
                  <Card
                    key={scholarship.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {scholarship.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{scholarship.provider}</Badge>
                            <Badge variant="outline">{scholarship.level}</Badge>
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-600"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Deadline: {scholarship.deadline}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {scholarship.amount}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {scholarship.description}
                      </CardDescription>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Eligibility Criteria
                          </h4>
                          <p className="text-muted-foreground">
                            {scholarship.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Benefits Included</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1">
                          <a
                            href={scholarship.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply for Scholarship
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline">Download Form</Button>
                        <Button variant="outline">Get Guidelines</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Application Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Scholarship Application Tips</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Before Applying:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Ensure you meet eligibility criteria</li>
                <li>• Gather all required documents</li>
                <li>• Check application deadlines</li>
                <li>• Verify disability percentage certificate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">After Applying:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Save application reference number</li>
                <li>• Track application status regularly</li>
                <li>• Keep copies of all documents</li>
                <li>• Contact helpline for queries</li>
              </ul>
            </div>
          </CardContent>
        </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Scholarships;
