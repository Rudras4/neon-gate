import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Shield, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import heroConcert from "@/assets/hero-concert.jpg";
import heroCorporate from "@/assets/hero-corporate.jpg";

export function Hero() {
  const { theme } = useTheme();
  const heroImage = theme === "dark" ? heroConcert : heroCorporate;
  const eventType = theme === "dark" ? "concerts & parties" : "corporate events";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Event venue"
          className="w-full h-full object-cover theme-transition"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The Future of{" "}
            <span className="text-glow bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Event Ticketing
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            Secure, transparent, and fraud-proof tickets powered by blockchain technology.
            Perfect for {eventType} and beyond.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-background/20 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Anti-Fraud NFTs</span>
          </div>
          <div className="flex items-center space-x-2 bg-background/20 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Instant Transfers</span>
          </div>
          <div className="flex items-center space-x-2 bg-background/20 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span>Verifiable Ownership</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button className="btn-hero text-lg px-8 py-6">
            Explore Events
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="bg-background/20 backdrop-blur-sm border-border/50">
            Organize Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
            <div className="text-sm text-foreground/60">Events Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">500K+</div>
            <div className="text-sm text-foreground/60">Tickets Sold</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">Zero</div>
            <div className="text-sm text-foreground/60">Fraud Cases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
            <div className="text-sm text-foreground/60">Availability</div>
          </div>
        </div>
      </div>
    </section>
  );
}