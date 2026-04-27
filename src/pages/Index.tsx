import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCards from "@/components/ServiceCards";
import EducationSection from "@/components/EducationSection";
import RulesRegulationsSection from "@/components/RulesRegulationsSection";
import SearchSection from "@/components/SearchSection";
import SignLanguageDetector from "@/components/SignLanguageDetector";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { useEffect, useState } from "react";

const Index = () => {
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    fetch("http://localhost:5000/api/profile", {
      headers: {
        Authorization: token
      }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }
}, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServiceCards />
        <EducationSection />
        <RulesRegulationsSection />
        <SearchSection />
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Sign Language Assistant
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                For users who cannot speak, use our AI-powered sign language detection to communicate your needs
              </p>
            </div>
            <SignLanguageDetector />
          </div>
        </section>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
