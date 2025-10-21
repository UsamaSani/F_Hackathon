import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import {
  FileText,
  Brain,
  Shield,
  BarChart3,
  Clock,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: "Upload Reports",
      description: "Securely store all medical reports in one place",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get instant insights from Gemini AI",
    },
    {
      icon: Globe,
      title: "Bilingual Support",
      description: "Available in English and Roman Urdu",
    },
    {
      icon: BarChart3,
      title: "Health Timeline",
      description: "Track your health journey over time",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access reports anytime, anywhere",
    },
  ];

  const benefits = [
    "No more lost reports or prescriptions",
    "Understand medical terms in simple language",
    "Track vitals like BP, sugar, weight manually",
    "Get AI-generated questions for your doctor",
    "Receive dietary suggestions and home remedies",
    "Keep all family members' health records organized",
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Health Records,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Store, analyze, and understand your medical reports with AI-powered insights.
                Sehat ka smart dost – your intelligent health companion.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-primary animate-pulse-glow" asChild>
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="animate-fade-in">
              <img
                src={heroImage}
                alt="Healthcare professionals"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage your health records
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 glass-effect hover:shadow-lg transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold mb-6">
                Why Choose HealthMate?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Manage your family's health records with confidence. Our AI-powered
                platform makes healthcare management simple and accessible.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-fade-in">
              <Card className="p-8 glass-effect">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI-Powered</h3>
                      <p className="text-muted-foreground">Gemini AI analyzes reports</p>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <p className="text-sm text-muted-foreground italic">
                      "This AI is for understanding only, not for medical advice. Always
                      consult your doctor before making any decision."
                    </p>
                    <p className="text-sm text-muted-foreground italic mt-2">
                      "Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi."
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users managing their health records with HealthMate
          </p>
          <Button size="lg" variant="secondary" className="shadow-glow" asChild>
            <Link to="/signup">
              Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 HealthMate. Your trusted health companion.</p>
        </div>
      </footer>
    </div>
  );
}
