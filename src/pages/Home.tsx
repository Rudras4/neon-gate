import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, Zap } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background to-accent/10">
        <div className="container">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to NeonGate
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover, organize, and attend amazing events. Connect with your community and create unforgettable experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/events">Explore Events</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/organize">Create Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose NeonGate?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover and organize events in one place
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Easy Discovery</h3>
              <p className="text-muted-foreground">
                Find events that match your interests with powerful search and filtering options.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with like-minded people and build lasting relationships through shared experiences.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Simple Organization</h3>
              <p className="text-muted-foreground">
                Create and manage your own events with our intuitive event organization tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
