import { EventCard } from "@/components/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { analyticsAPI } from "@/lib/api";

interface EventGridProps {
  searchQuery: string;
  filters: any;
  events: any[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to determine event tier based on price
const getEventTier = (price: number): "Platinum" | "Gold" | "Silver" | "Bronze" => {
  if (price >= 100) return "Platinum";
  if (price >= 50) return "Gold";
  if (price >= 25) return "Silver";
  return "Bronze";
};

// Helper function to check if event is popular (high attendance ratio)
const isEventPopular = (attendees: number, maxAttendees: number): boolean => {
  if (!maxAttendees || maxAttendees === 0) return false;
  return attendees / maxAttendees >= 0.7;
};

// Helper function to get attendance percentage
const getAttendancePercentage = (attendees: number, maxAttendees: number): number => {
  if (!maxAttendees || maxAttendees === 0) return 0;
  return Math.round((attendees / maxAttendees) * 100);
};

// Helper function to get default image based on category
const getDefaultImage = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'concert':
    case 'music':
      return "/src/assets/hero-concert.jpg";
    case 'conference':
    case 'workshop':
    case 'corporate':
      return "/src/assets/hero-corporate.jpg";
    case 'theater':
    case 'comedy':
      return "/src/assets/venue-theater.jpg";
    default:
      return "/src/assets/web3-features.jpg";
  }
};

export function EventGrid({ searchQuery, filters, events, isLoading, error }: EventGridProps) {
  const [sortBy, setSortBy] = useState("date");
  const [userInteractions, setUserInteractions] = useState<{[key: string]: number}>({});

  // Track user interactions with events
  const trackEventInteraction = async (eventId: string, action: 'view' | 'click' | 'favorite') => {
    setUserInteractions(prev => ({
      ...prev,
      [`${eventId}_${action}`]: (prev[`${eventId}_${action}`] || 0) + 1
    }));
    
    // Send analytics to backend
    try {
      await analyticsAPI.trackEvent(eventId, action);
      
      // Also track detailed user behavior
      await analyticsAPI.trackUserInteraction(eventId, action, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer
      });
    } catch (error) {
      console.error('Failed to track event interaction:', error);
    }
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // First filter events
    let filtered = events.filter((event) => {
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Location filter
      if (filters.location && !event.venue_name?.includes(filters.location)) {
        return false;
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Type filter
      if (filters.type && event.event_type !== filters.type) {
        return false;
      }

      // Price filter
      const eventPrice = event.price || 0;
      if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
        return false;
      }

      return true;
    });

    // Then sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "popularity":
          // For now, sort by capacity since we don't have attendees yet
          return (b.capacity || 0) - (a.capacity || 0);
        case "date":
        default:
          return new Date(a.start_date || a.date || 0).getTime() - new Date(b.start_date || b.date || 0).getTime();
      }
    });

    return filtered;
  }, [events, searchQuery, filters, sortBy]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Loading events...</h3>
          <p className="text-muted-foreground">Please wait while we fetch the latest events.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {filteredAndSortedEvents.length} Event{filteredAndSortedEvents.length !== 1 ? 's' : ''} Found
          </h2>
          {searchQuery && (
            <p className="text-muted-foreground">
              Showing results for "{searchQuery}"
            </p>
          )}
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="price">Sort by Price (Low to High)</SelectItem>
            <SelectItem value="popularity">Sort by Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {filteredAndSortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => {
            // Transform backend data to match EventCard props
            const transformedEvent = {
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.start_date || event.date,
              location: event.venue_name || event.location || 'Location TBD',
              price: event.price?.toString() || '0',
              image: event.image_url || getDefaultImage(event.category),
              tier: getEventTier(event.price || 0),
              attendees: event.attendees || 0,
              maxAttendees: event.capacity || 100,
              isPopular: isEventPopular(event.attendees || 0, event.capacity || 100),
              category: event.category,
              eventType: event.event_type
            };
            
            return (
              <div key={event.id}>
                <EventCard {...transformedEvent} onInteraction={trackEventInteraction} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-muted rounded-full"></span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find more events.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}