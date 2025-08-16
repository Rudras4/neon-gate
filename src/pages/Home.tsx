import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, Zap } from "lucide-react";
import Globe3D from "@/components/ui/hero";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0a0613] theme-transition">
      <Navbar />
      
      {/* Hero Section */}
      <Globe3D />

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-[#0a0613] to-[#150d27] text-white">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose NeonGate?</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything you need to discover and organize events in one place
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Easy Discovery</h3>
              <p className="text-white/70">
                Find events that match your interests with powerful search and filtering options.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Community Driven</h3>
              <p className="text-white/70">
                Connect with like-minded people and build lasting relationships through shared experiences.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Simple Organization</h3>
              <p className="text-white/70">
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
