import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
