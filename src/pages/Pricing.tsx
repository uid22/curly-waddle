import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Basic profile customization",
        "Up to 10 links",
        "Standard badge",
        "Basic analytics",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      price: "$9.99",
      description: "For power users who want more",
      features: [
        "Custom premium badge with text",
        "Typewriting bio animation",
        "Unlimited links",
        "4 premium profile layouts",
        "Advanced analytics",
        "Priority support",
        "Remove iayx.lol branding",
      ],
      cta: "Upgrade to Premium",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">i</span>
              </div>
              <span className="text-xl font-bold text-foreground">iayx.lol</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. Upgrade anytime to unlock premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-muted-foreground">/month</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact for Custom Plans */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Need a custom plan for your team or business?
          </p>
          <Button variant="outline" size="lg">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
