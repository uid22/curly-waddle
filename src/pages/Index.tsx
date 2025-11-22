import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero text-white">
      <nav className="container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              iayx.lol
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://discord.gg/wg9F9BgKah" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                Discord
              </Button>
            </a>
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-6xl md:text-7xl font-bold leading-tight">
            Your Links,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              All in One Place
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Share everything with one simple link. Modern, fast, and beautifully designed.
          </p>
          <div>
            <Button
              size="lg"
              className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-white shadow-glow"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Pricing
              </span>
            </h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose the plan that's right for you. Upgrade anytime to unlock premium features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative border border-white/10 rounded-lg p-8 bg-card/20 backdrop-blur-md">
              <div className="text-center pb-8">
                <h4 className="text-2xl font-bold mb-2">Free</h4>
                <div className="mb-2">
                  <span className="text-4xl font-bold">$0</span>
                </div>
                <p className="text-white/70">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Basic profile customization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Up to 10 links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Social media integration</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>

            <div className="relative border-2 border-primary rounded-lg p-8 bg-card/20 backdrop-blur-md scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-center pb-8">
                <h4 className="text-2xl font-bold mb-2">Premium</h4>
                <div className="mb-2">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-white/70">/month</span>
                </div>
                <p className="text-white/70">For power users who want more</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Unlimited links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Custom badge on profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Custom role in Discord server</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">2 premium layouts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">Custom icon</span>
                </li>
              </ul>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-glow"
                onClick={() => navigate("/auth")}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
