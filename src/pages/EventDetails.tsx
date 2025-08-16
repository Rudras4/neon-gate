import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventHeader } from "@/components/EventHeader";
import { EventInfo } from "@/components/EventInfo";
import { EventVenue } from "@/components/EventVenue";
import { EventTickets } from "@/components/EventTickets";
import { EventAbout } from "@/components/EventAbout";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();
  
  // Mock event data - replace with actual data fetching
  const event = {
    id: id || "1",
    title: "Tech Conference 2024",
    description: "Join industry leaders for cutting-edge insights into technology trends",
    date: "March 15, 2024",
    time: "10:00 AM - 6:00 PM",
    duration: "8 hours",
    location: "Convention Center, Mumbai",
    language: "English",
    type: "In-person",
    category: "Conference",
    ageLimit: "18+",
    price: "150",
    image: "/assets/hero-corporate.jpg",
    organizer: {
      name: "TechEvents Inc",
      description: "Leading event organizer in tech industry",
      avatar: "/placeholder.svg"
    },
    venue: {
      images: ["/assets/venue-theater.jpg"],
      splineUrl: ""
    },
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
        <EventHeader event={event} />
        
        {/* Main Content Area */}
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <EventVenue venue={event.venue} />
              
              {/* Event Description */}
              <EventAbout event={event} />
            </div>
            
            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <EventTickets tickets={event.tickets} eventId={event.id} />
                <EventInfo event={event} />
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