import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventHeader } from "@/components/EventHeader";
import { EventInfo } from "@/components/EventInfo";
import { EventMedia } from "@/components/EventMedia";
import { EventTickets } from "@/components/EventTickets";
import { EventAbout } from "@/components/EventAbout";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to generate real ticket data from database
  const generateRealTicketData = (event: any) => {
    // Check if this is a Web3 event with tier data
    if (event.event_source === 'web3' && event.tier_prices && event.tier_quantities) {
      try {
        const tierPrices = JSON.parse(event.tier_prices);
        const tierQuantities = JSON.parse(event.tier_quantities);
        
        // Create tickets from Web3 tier data
        const tickets = [];
        for (let i = 0; i < tierPrices.length && i < tierQuantities.length; i++) {
          if (tierPrices[i] && tierQuantities[i]) {
            const price = parseFloat(tierPrices[i]);
            const quantity = parseInt(tierQuantities[i]);
            
            if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
              // Generate tier name based on price or use index
              let tierName = `Tier ${i + 1}`;
              if (price >= 100) tierName = "Platinum";
              else if (price >= 50) tierName = "Gold";
              else if (price >= 25) tierName = "Silver";
              else tierName = "Bronze";
              
              tickets.push({
                tier: tierName,
                price: price.toString(),
                available: quantity,
                total: quantity,
                originalIndex: i
              });
            }
          }
        }
        
        // If we have valid Web3 tickets, return them
        if (tickets.length > 0) {
          console.log('🎫 Generated Web3 tickets from tier data:', tickets);
          return tickets;
        }
      } catch (error) {
        console.warn('Failed to parse Web3 tier data:', error);
      }
    }
    
    // Fallback for traditional events or if Web3 parsing fails
    if (event.price && event.capacity) {
      const price = parseFloat(event.price);
      const capacity = parseInt(event.capacity);
      
      if (!isNaN(price) && !isNaN(capacity)) {
        // Generate single tier for traditional events
        let tierName = "General";
        if (price >= 100) tierName = "Platinum";
        else if (price >= 50) tierName = "Gold";
        else if (price >= 25) tierName = "Silver";
        else tierName = "Bronze";
        
        return [{
          tier: tierName,
          price: event.price.toString(),
          available: capacity,
          total: capacity
        }];
      }
    }
    
    // Final fallback - return empty array
    console.log('⚠️ No valid ticket data found, returning empty tickets array');
    return [];
  };

  // Helper function to get venue images with proper fallbacks
  const getVenueImages = (event: any) => {
    const images = [];
    
    // Add main image if available
    if (event.image_url) {
      images.push(event.image_url);
    }
    
    // Add image gallery if available
    if (event.image_gallery) {
      try {
        const galleryImages = JSON.parse(event.image_gallery);
        if (Array.isArray(galleryImages)) {
          images.push(...galleryImages);
        }
      } catch (error) {
        console.warn('Failed to parse image gallery:', error);
      }
    }
    
    // If no images found, use default
    if (images.length === 0) {
      images.push("/src/assets/hero-corporate.jpg");
    }
    
    console.log('🖼️ Generated venue images:', images);
    return images;
  };

  // Fetch event data directly from backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch directly from backend API
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 Raw event data from backend:', data.event);
        console.log('🔍 Web3 fields:', {
          event_source: data.event.event_source,
          event_type: data.event.event_type,
          blockchain_tx_hash: data.event.blockchain_tx_hash,
          tier_prices: data.event.tier_prices,
          tier_quantities: data.event.tier_quantities
        });
        
        setEvent(data.event);
      } catch (err: any) {
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

  // Enhanced data transformation with real data mapping and Web3 support
  console.log('🔍 Starting event transformation for:', event.title);
  
  const transformedEvent = {
    id: event.id,
    title: event.title || "Untitled Event",
    description: event.description || "No description available",
    longDescription: event.long_description || event.description || "No detailed description available",
    date: event.start_date || event.date || "Date TBD",
    time: event.start_date && event.end_date ? 
      `${new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 
      "Time TBD",
    duration: event.start_date && event.end_date ? 
      `${Math.round((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60))} hours` : 
      "Duration TBD",
    location: event.venue_name || event.venue_city || event.location || "Location TBD",
    language: "English", // Default language (no field in database)
    type: event.event_type || "In-person", // Use real event type if available
    category: event.category || event.event_type || "Event",
    ageLimit: "18+", // Default age limit (no field in database)
    price: event.price?.toString() || "0",
    image: event.image_url || "/src/assets/hero-corporate.jpg",
    organizer: {
      name: event.organizer_name || "Event Organizer",
      description: event.organizer_bio || "Event organizer", // Simplified default
      avatar: event.organizer_avatar || "/src/assets/hero-corporate.jpg"
    },
    venue: {
      name: event.venue_name || event.venue || "Venue TBD",
      address: event.venue_address || "Address TBD",
      city: event.venue_city || "City TBD",
      state: event.venue_state || "State TBD",
      country: event.venue_country || "Country TBD",
      postalCode: event.venue_postal_code || "",
      images: getVenueImages(event), // Enhanced image handling
      splineUrl: event.spline_3d_url || null
    },
    speakers: event.speakers || [],
    terms: event.terms || "Standard event terms apply",
    tickets: generateRealTicketData(event), // ✅ CRITICAL: Replace hardcoded tickets with real data
    // Additional event details
    capacity: event.capacity || "Unlimited",
    status: event.status || "published",
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    // Venue coordinates
    coordinates: event.latitude && event.longitude ? {
      lat: event.latitude,
      lng: event.longitude
    } : null,
    // Web3-specific properties
    isWeb3Event: event.event_source === 'web3' || event.event_type === 'web3',
    blockchainTxHash: event.blockchain_tx_hash,
    eventContractAddress: event.event_contract_address,
    eventSource: event.event_source,
    tierPrices: event.tier_prices,
    tierQuantities: event.tier_quantities
  };

  console.log('🎯 Final transformed event:', {
    title: transformedEvent.title,
    isWeb3Event: transformedEvent.isWeb3Event,
    tickets: transformedEvent.tickets,
    venueImages: transformedEvent.venue.images,
    organizer: transformedEvent.organizer
  });

  // Debug Web3 event details
  console.log('🔗 Web3 Event Details:', {
    eventSource: event.event_source,
    eventType: event.event_type,
    isWeb3Event: transformedEvent.isWeb3Event,
    blockchainTxHash: event.blockchain_tx_hash,
    eventContractAddress: event.event_contract_address,
    hasContractAddress: !!event.event_contract_address
  });

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
                  <EventTickets 
                    tickets={transformedEvent.tickets} 
                    eventId={transformedEvent.id}
                    isWeb3Event={transformedEvent.isWeb3Event}
                    blockchainTxHash={transformedEvent.blockchainTxHash}
                    eventContractAddress={transformedEvent.eventContractAddress}
                  />
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