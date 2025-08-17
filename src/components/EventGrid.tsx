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
const getDefaultImage = (category?: string): string => {
  if (!category || typeof category !== 'string') {
    return "/src/assets/web3-features.jpg"; // Default fallback
  }
  
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
  
  // Enhanced debug logging with Web3 focus
  console.log('🔍 EventGrid received events:', events);
  console.log('🔍 EventGrid filters:', filters);
  console.log('🔍 EventGrid searchQuery:', searchQuery);
  
  // Log Web3 event information
  if (events && events.length > 0) {
    const web3Events = events.filter(event => 
      event.isWeb3Event || event.event_source === 'web3' || event.event_type === 'web3'
    );
    console.log('🔍 Web3 events in EventGrid:', web3Events.length);
    
    if (web3Events.length > 0) {
      console.log('🔍 Web3 event details:', web3Events.map(e => ({
        id: e.id,
        title: e.title,
        event_source: e.event_source,
        event_type: e.event_type,
        blockchain_tx_hash: e.blockchain_tx_hash,
        tier_prices: e.tier_prices
      })));
    }
    
    console.log('🔍 First event structure:', events[0]);
    console.log('🔍 First event keys:', Object.keys(events[0]));
  }
  
  // Safety check for events data
  if (!Array.isArray(events)) {
    console.error('❌ Events is not an array:', events);
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-semibold mb-2">Invalid Data Format</h3>
          <p className="text-muted-foreground">Events data is not in the expected format.</p>
        </div>
      </div>
    );
  }

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

  // Enhanced filter and sort events with Web3 support
  const filteredAndSortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // Validate events array and filter out invalid entries
    const validEvents = events.filter(event => {
      return event && typeof event === 'object' && event.title;
    });
    
    console.log('🔍 Valid events after filtering:', validEvents.length);
    
    // Log Web3 events for debugging
    const web3Events = validEvents.filter(event => 
      event.isWeb3Event || event.event_source === 'web3' || event.event_type === 'web3'
    );
    console.log('🔍 Web3 events found in valid events:', web3Events.length);
    
    // First filter events with proper null checks
    let filtered = validEvents.filter((event) => {
      // Ensure event has required properties
      if (!event || !event.title) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Location filter - handle both data structures
      if (filters.location) {
        const location = event.venue_name || event.location;
        if (!location || !location.includes(filters.location)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Type filter - handle both data structures and Web3 events
      if (filters.type && filters.type !== 'all') {
        if (filters.type === 'web3') {
          // Filter for Web3 events specifically
          if (!(event.isWeb3Event || event.event_source === 'web3' || event.event_type === 'web3')) {
            return false;
          }
        } else if (event.event_type !== filters.type) {
          return false;
        }
      }

      // Price filter - handle both data structures and Web3 tier pricing
      if (filters.priceRange && filters.priceRange[1] < 1000) { // Only apply if not showing all prices
        let eventPrice = parseFloat(event.price) || 0;
        
        // For Web3 events, try to get the minimum tier price
        if (event.isWeb3Event || event.event_source === 'web3') {
          try {
            if (event.tier_prices) {
              const tierPrices = JSON.parse(event.tier_prices);
              const validPrices = tierPrices.filter((p: string) => p !== '' && !isNaN(parseFloat(p)));
              if (validPrices.length > 0) {
                eventPrice = Math.min(...validPrices.map((p: string) => parseFloat(p)));
              }
            }
          } catch (e) {
            console.warn('Failed to parse Web3 tier prices for filtering:', e);
          }
        }
        
        if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
          return false;
        }
      }

      return true;
    });

    // Enhanced sorting with Web3 event support
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          let priceA = parseFloat(a.price) || 0;
          let priceB = parseFloat(b.price) || 0;
          
          // For Web3 events, use minimum tier price
          if (a.isWeb3Event || a.event_source === 'web3') {
            try {
              if (a.tier_prices) {
                const tierPrices = JSON.parse(a.tier_prices);
                const validPrices = tierPrices.filter((p: string) => p !== '' && !isNaN(parseFloat(p)));
                if (validPrices.length > 0) {
                  priceA = Math.min(...validPrices.map((p: string) => parseFloat(p)));
                }
              }
            } catch (e) {
              console.warn('Failed to parse Web3 tier prices for sorting:', e);
            }
          }
          
          if (b.isWeb3Event || b.event_source === 'web3') {
            try {
              if (b.tier_prices) {
                const tierPrices = JSON.parse(b.tier_prices);
                const validPrices = tierPrices.filter((p: string) => p !== '' && !isNaN(parseFloat(p)));
                if (validPrices.length > 0) {
                  priceB = Math.min(...validPrices.map((p: string) => parseFloat(p)));
                }
              }
            } catch (e) {
              console.warn('Failed to parse Web3 tier prices for sorting:', e);
            }
          }
          
          return priceA - priceB;
          
        case "popularity":
          // For now, sort by capacity since we don't have attendees yet
          return (b.capacity || 0) - (a.capacity || 0);
          
        case "web3":
          // Sort Web3 events first, then by date
          const aIsWeb3 = a.isWeb3Event || a.event_source === 'web3' || a.event_type === 'web3';
          const bIsWeb3 = b.isWeb3Event || b.event_source === 'web3' || b.event_type === 'web3';
          
          if (aIsWeb3 && !bIsWeb3) return -1;
          if (!aIsWeb3 && bIsWeb3) return 1;
          
          // If both are same type, sort by date
          return new Date(a.start_date || a.date || 0).getTime() - new Date(b.start_date || b.date || 0).getTime();
          
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
      {/* Enhanced Results Header with Web3 Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {filteredAndSortedEvents.length} Event{filteredAndSortedEvents.length !== 1 ? 's' : ''} Found
          </h2>
          
          {/* Web3 Event Summary */}
          {(() => {
            const web3Count = filteredAndSortedEvents.filter(event => 
              event.isWeb3Event || event.event_source === 'web3' || event.event_type === 'web3'
            ).length;
            
            if (web3Count > 0) {
              return (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-muted-foreground">Including</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    <span className="mr-1">⛓️</span>
                    {web3Count} Web3 Event{web3Count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            }
            return null;
          })()}
          
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
            <SelectItem value="web3">Web3 Events First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {filteredAndSortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => {
            try {
              // Enhanced transformation with comprehensive Web3 support
              const isWeb3Event = event.isWeb3Event || event.event_source === 'web3' || event.event_type === 'web3';
              
              // Enhanced price handling for Web3 events
              let displayPrice = event.price?.toString() || '0';
              let tierPrices = event.tierPrices || event.tier_prices;
              let tierQuantities = event.tierQuantities || event.tier_quantities;
              
              if (isWeb3Event && event.tier_prices) {
                try {
                  const parsedTierPrices = JSON.parse(event.tier_prices);
                  const validPrices = parsedTierPrices.filter((p: string) => p !== '' && !isNaN(parseFloat(p)));
                  if (validPrices.length > 0) {
                    const minPrice = Math.min(...validPrices.map((p: string) => parseFloat(p)));
                    const maxPrice = Math.max(...validPrices.map((p: string) => parseFloat(p)));
                    
                    if (minPrice === maxPrice) {
                      displayPrice = minPrice.toString();
                    } else {
                      displayPrice = `${minPrice}-${maxPrice}`;
                    }
                  }
                } catch (e) {
                  console.warn('Failed to parse Web3 tier prices for display:', e);
                }
              }
              
              // Enhanced location handling for Web3 events
              let displayLocation = event.venue_name || event.location || 'Location TBD';
              if (isWeb3Event && event.blockchain_tx_hash) {
                const venue = event.venue_name || event.venue_city;
                displayLocation = venue ? `${venue} (Blockchain)` : 'Blockchain Event';
              }
              
              const transformedEvent = {
                id: event.id || `event-${Math.random()}`,
                title: event.title || 'Untitled Event',
                description: event.description || 'No description available',
                date: event.start_date || event.date || new Date().toISOString(),
                location: displayLocation,
                price: displayPrice,
                image: event.image_url || getDefaultImage(event.category),
                tier: event.tier || (isWeb3Event ? 'Web3' : getEventTier(parseFloat(displayPrice) || 0)),
                attendees: event.attendees || 0,
                maxAttendees: event.capacity || event.maxAttendees || 100,
                isPopular: event.isPopular || isEventPopular(event.attendees || 0, event.capacity || event.maxAttendees || 100),
                // Enhanced Web3-specific properties
                isWeb3Event,
                blockchainTxHash: event.blockchainTxHash || event.blockchain_tx_hash,
                eventSource: event.eventSource || event.event_source,
                tierPrices,
                tierQuantities,
                // Organizer information
                organizerName: event.organizer_name || event.organizerName,
                organizerId: event.organizer_id || event.organizerId
              };
              
              return (
                <div key={event.id || `event-${Math.random()}`}>
                  <EventCard {...transformedEvent} onInteraction={trackEventInteraction} />
                </div>
              );
            } catch (transformError) {
              console.error('❌ Error transforming event:', event, transformError);
              // Return a fallback event card for failed transformations
              return (
                <div key={`fallback-${Math.random()}`}>
                  <EventCard 
                    id="fallback"
                    title="Event Loading Error"
                    description="This event could not be loaded properly."
                    date={new Date().toISOString()}
                    location="Unknown Location"
                    price="0"
                    image="/src/assets/web3-features.jpg"
                    tier="Gold"
                    attendees={0}
                    maxAttendees={100}
                    isPopular={false}
                    onInteraction={trackEventInteraction}
                  />
                </div>
              );
            }
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