import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventHeader } from "@/components/EventHeader";
import { EventInfo } from "@/components/EventInfo";
import { EventMedia } from "@/components/EventMedia";
import { EventTickets } from "@/components/EventTickets";
import { EventAbout } from "@/components/EventAbout";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { eventsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch event data from backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await eventsAPI.getById(id) as { event: any };
        setEvent(response.event);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background theme-transition">
        <Navbar />
        <div className="container py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background theme-transition">
        <Navbar />
        <div className="container py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <a
              href="/events"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Events
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Transform backend data to match component props
  const transformedEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    longDescription: event.long_description,
    date: event.start_date || event.date,
    time: event.start_date ? 
      `${new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 
      "TBD",
    duration: event.start_date && event.end_date ? 
      `${Math.round((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60))} hours` : 
      "TBD",
    location: event.venue_name || event.location || "Location TBD",
    language: "English",
    type: "In-person",
    category: event.category || "Event",
    ageLimit: "18+",
    price: event.price?.toString() || "0",
    image: event.image_url || "/src/assets/hero-corporate.jpg",
    organizer: {
      name: event.organizer_name || "Event Organizer",
      description: "Professional event organizer with years of experience in creating memorable events.",
      avatar: event.organizer_avatar || "/placeholder.svg"
    },
    venue: {
      images: [event.image_url || "/src/assets/hero-corporate.jpg"],
      splineUrl: event.spline_3d_url
    },
    speakers: event.speakers || [],
    terms: event.terms,
    tickets: [
      { tier: "Platinum", price: "500", available: 10, total: 50 },
      { tier: "Gold", price: "300", available: 25, total: 100 },
      { tier: "Silver", price: "150", available: 50, total: 200 },
      { tier: "Bronze", price: "75", available: 100, total: 300 }
    ]
  };

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      
      <div>
        {/* Hero Section - Full Width */}
        <EventHeader event={transformedEvent} />
        
        {/* Main Content Area */}
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery and 3D View */}
              <EventMedia 
                images={transformedEvent.venue.images}
                spline3dUrl={transformedEvent.venue.splineUrl}
              />
              
              {/* Event Description and About Sections */}
              <EventAbout event={transformedEvent} />
            </div>
            
            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div id="tickets-section">
                  <EventTickets tickets={transformedEvent.tickets} eventId={transformedEvent.id} />
                </div>
                <EventInfo event={transformedEvent} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetails;