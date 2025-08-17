import { EventCard } from "./EventCard";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

export function FeaturedEvents() {
  const { events, loading, error, refetch } = useEvents();

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discovering amazing events powered by blockchain technology...
            </p>
          </div>
          
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events powered by blockchain technology. Secure, transparent, and memorable experiences.
            </p>
          </div>
          
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-red-800">Error Loading Events</h3>
                <p className="text-muted-foreground mb-6">
                  {error}
                </p>
              </div>
              
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show events if available
  if (events.length > 0) {
    // Get featured events (first 4 events)
    const featuredEvents = events.slice(0, 4);
    
    return (
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events powered by blockchain technology. Secure, transparent, and memorable experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <EventCard 
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                location={event.location}
                price={event.price.toString()}
                image={event.image_url || "/src/assets/hero-corporate.jpg"}
                tier={event.isWeb3Event ? "Web3" : "Gold"}
                attendees={event.attendees}
                maxAttendees={event.maxAttendees}
                isWeb3Event={event.isWeb3Event}
                blockchainTxHash={event.blockchain_tx_hash}
                eventSource={event.event_source}
                tierPrices={event.tier_prices}
                tierQuantities={event.tier_quantities}
                organizerName={event.organizer_name}
                organizerId={event.organizer_id.toString()}
                isPopular={event.attendees > event.maxAttendees * 0.8}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="text-primary hover:text-primary-glow font-medium">
              View All Events →
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Show no events message
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing events powered by blockchain technology. Secure, transparent, and memorable experiences.
          </p>
        </div>

        {/* No events available message */}
        <div className="text-center py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎫</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">
                The featured events section will display real events from the platform. 
                Currently, there are no published events to showcase.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">🎯 Create Your First Event</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Organize an event and experience the power of blockchain ticketing
                </p>
                <Button variant="outline" size="sm" className="text-primary hover:text-primary-glow font-medium text-sm">
                  Start Organizing →
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2">🔍 Browse All Events</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  View all available events in the platform
                </p>
                <Button variant="outline" size="sm" className="text-primary hover:text-primary-glow font-medium text-sm">
                  View Events →
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>💡 <strong>Pro tip:</strong> Events created through the platform will automatically appear here once published.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="text-primary hover:text-primary-glow font-medium">
            View All Events →
          </Button>
        </div>
      </div>
    </section>
  );
}