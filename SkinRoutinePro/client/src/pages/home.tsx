import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: "fas fa-user-md",
      title: "Expert Analysis",
      description: "AI-powered skin assessment based on dermatological research and expert recommendations"
    },
    {
      icon: "fas fa-leaf",
      title: "Natural & Commercial",
      description: "Choose between effective home remedies and professional skincare products, or combine both"
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Seasonal Adaptation",
      description: "Routines automatically adjust for seasonal changes and environmental factors"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Allergy Safe",
      description: "Comprehensive ingredient analysis with personalized allergy warnings and alternatives"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-surface to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
            Your Perfect Skincare Routine Awaits
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover personalized skincare solutions tailored to your unique skin type, concerns, and lifestyle. 
            Get recommendations for both natural home remedies and premium products.
          </p>
          <Link href="/questionnaire">
            <Button 
              size="lg" 
              className="skincare-primary text-lg px-8 py-4"
              data-testid="button-start-assessment"
            >
              <i className="fas fa-magic mr-2"></i>
              Start Your Skin Assessment
            </Button>
          </Link>

          {/* Feature Cards */}
          <div className="hero-features mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card fade-in hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="feature-icon mb-4">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
                  <p className="text-secondary leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              How It Works
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Get your personalized skincare routine in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-clipboard-list text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Take Assessment</h3>
              <p className="text-secondary">
                Answer questions about your skin type, concerns, and lifestyle preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-cogs text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Get Recommendations</h3>
              <p className="text-secondary">
                Receive personalized routine with both home remedies and product suggestions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-star text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Track Progress</h3>
              <p className="text-secondary">
                Save routines, track improvements, and adjust for seasonal changes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of users who have discovered their perfect skincare routine with our personalized approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/questionnaire">
              <Button 
                size="lg" 
                className="skincare-primary"
                data-testid="button-start-now"
              >
                Start Assessment Now
              </Button>
            </Link>
            <Link href="/auth">
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-create-account"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
