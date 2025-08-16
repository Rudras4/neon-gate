import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventFilters } from "@/components/EventFilters";
import { EventGrid } from "@/components/EventGrid";
import { useState, useEffect } from "react";
import { eventsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all published events
        const response = await eventsAPI.getAll() as { events: any[] };
        setEvents(response.events || []);
        
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

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

      {/* Main Content with Sidebar Layout */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-24">
                <EventFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>

            {/* Right Content - Events Grid */}
            <div className="flex-1">
              <EventGrid 
                searchQuery={searchQuery} 
                filters={filters} 
                events={events}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;