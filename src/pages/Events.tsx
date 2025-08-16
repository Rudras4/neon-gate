import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventFilters } from "@/components/EventFilters";
import { EventGrid } from "@/components/EventGrid";
import { useState } from "react";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    language: "",
    type: "",
    priceRange: [0, 1000],
    dateRange: null
  });

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-background to-accent/10">
        <div className="container">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Explore Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events happening around you. From concerts to conferences, find your next experience.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-6">
            <EventFilters 
              filters={filters}
              onFiltersChange={setFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container">
          <EventGrid searchQuery={searchQuery} filters={filters} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;