import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventFilters } from "@/components/EventFilters";
import { EventGrid } from "@/components/EventGrid";
import { useState, useEffect } from "react";
import { eventsAPI, searchAPI } from "@/lib/api";
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
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [web3EventStats, setWeb3EventStats] = useState({ total: 0, web3: 0, traditional: 0 });
  const { toast } = useToast();

  // ✅ ENHANCED: Transform backend event data with comprehensive Web3 support
  const transformEventData = (backendEvent: any) => {
    // Debug logging for Web3 event detection
    console.log('🔍 Processing event:', {
      id: backendEvent.id,
      title: backendEvent.title,
      event_source: backendEvent.event_source,
      event_type: backendEvent.event_type,
      blockchain_tx_hash: backendEvent.blockchain_tx_hash,
      tier_prices: backendEvent.tier_prices,
      tier_quantities: backendEvent.tier_quantities
    });
    // Determine if this is a Web3 event with proper validation
    const isWeb3Event = backendEvent.event_source === 'web3' || backendEvent.event_type === 'web3';
    
    // Enhanced image selection with Web3-specific logic
    const getEventImage = () => {
      if (backendEvent.image_url) return backendEvent.image_url;
      if (isWeb3Event) return "/src/assets/web3-features.jpg"; // Web3-specific image
      return "/src/assets/hero-corporate.jpg"; // Default image
    };
    
    // Enhanced location display with Web3 context
    const getLocationDisplay = () => {
      if (isWeb3Event && backendEvent.blockchain_tx_hash) {
        // Show venue if available, otherwise generic blockchain label
        const venue = backendEvent.venue_name || backendEvent.venue_city;
        return venue ? `${venue} (Blockchain)` : "Blockchain Event";
      }
      return backendEvent.venue_name || backendEvent.venue_city || backendEvent.location || "Location TBD";
    };
    
    // Enhanced price display with detailed Web3 tier information
    const getPriceDisplay = () => {
      if (isWeb3Event && backendEvent.tier_prices) {
        try {
          const tierPrices = JSON.parse(backendEvent.tier_prices);
          if (tierPrices.length > 0) {
            // Show actual pricing information instead of just "X tiers available"
            const validPrices = tierPrices.filter(price => price !== '' && !isNaN(parseFloat(price)));
            if (validPrices.length > 0) {
              const minPrice = Math.min(...validPrices.map(p => parseFloat(p)));
              const maxPrice = Math.max(...validPrices.map(p => parseFloat(p)));
              
              if (minPrice === maxPrice) {
                return `₹${minPrice}`;
              } else {
                return `₹${minPrice} - ₹${maxPrice}`;
              }
            }
            return `${tierPrices.length} tier${tierPrices.length > 1 ? 's' : ''} available`;
          }
        } catch (e) {
          console.warn('Failed to parse tier prices:', e);
        }
      }
      return backendEvent.price?.toString() || "0";
    };
    
    // Enhanced tier determination with Web3 priority
    const getEventTier = () => {
      if (isWeb3Event) return "Web3" as const;
      
      // Fallback to traditional tier logic based on price
      const price = parseFloat(backendEvent.price) || 0;
      if (price >= 100) return "Platinum" as const;
      if (price >= 50) return "Gold" as const;
      if (price >= 25) return "Silver" as const;
      return "Bronze" as const;
    };
    
      // Enhanced Web3 data validation and parsing
  const getWeb3Data = () => {
    if (!isWeb3Event) return {};
    
    let tierPrices = null;
    let tierQuantities = null;
    
    try {
      if (backendEvent.tier_prices) {
        tierPrices = JSON.parse(backendEvent.tier_prices);
        // Validate that tierPrices is an array
        if (!Array.isArray(tierPrices)) {
          console.warn('tier_prices is not an array:', backendEvent.tier_prices);
          tierPrices = null;
        }
      }
      if (backendEvent.tier_quantities) {
        tierQuantities = JSON.parse(backendEvent.tier_quantities);
        // Validate that tierQuantities is an array
        if (!Array.isArray(tierQuantities)) {
          console.warn('tier_quantities is not an array:', backendEvent.tier_quantities);
          tierQuantities = null;
        }
      }
    } catch (e) {
      console.warn('Failed to parse Web3 tier data:', e);
      tierPrices = null;
      tierQuantities = null;
    }
    
    return {
      tierPrices,
      tierQuantities,
      blockchainTxHash: backendEvent.blockchain_tx_hash,
      eventSource: backendEvent.event_source
    };
  };
    
    const web3Data = getWeb3Data();
    
    return {
      id: backendEvent.id,
      title: backendEvent.title || "Untitled Event",
      description: backendEvent.description || "No description available",
      date: backendEvent.start_date || backendEvent.date || "Date TBD",
      location: getLocationDisplay(),
      price: getPriceDisplay(),
      image: getEventImage(),
      tier: getEventTier(),
      attendees: 0, // Default attendees count
      maxAttendees: backendEvent.capacity || 100, // Use capacity or default
      isPopular: false, // Default popularity
      // Enhanced Web3-specific properties
      isWeb3Event,
      ...web3Data
    };
  };

  // Test transformation function with sample data
  const testTransformation = () => {
    const sampleWeb3Event = {
      id: 1,
      title: "Test Web3 Event",
      description: "A test Web3 event",
      event_source: "web3",
      event_type: "web3",
      blockchain_tx_hash: "0x1234567890abcdef",
      tier_prices: JSON.stringify(["100", "200", "300"]),
      tier_quantities: JSON.stringify(["50", "30", "20"]),
      venue_name: "Test Venue",
      venue_city: "Test City",
      capacity: 100,
      start_date: "2024-12-25"
    };
    
    const sampleTraditionalEvent = {
      id: 2,
      title: "Test Traditional Event",
      description: "A test traditional event",
      event_source: "traditional",
      event_type: "concert",
      price: "150",
      venue_name: "Traditional Venue",
      venue_city: "Traditional City",
      capacity: 200,
      start_date: "2024-12-26"
    };
    
    console.log('🧪 Testing Web3 event transformation:', transformEventData(sampleWeb3Event));
    console.log('🧪 Testing Traditional event transformation:', transformEventData(sampleTraditionalEvent));
  };

  // Test Web3 event fetching specifically
  const testWeb3EventFetching = async () => {
    console.log('🧪 Testing Web3 event fetching...');
    
    try {
      // Test the API directly
      const response = await eventsAPI.getAll() as { events: any[] };
      console.log('🧪 Direct API response:', response);
      
      if (response && response.events) {
        // Check for Web3 events specifically
        const web3Events = response.events.filter(event => 
          event.event_source === 'web3' || 
          event.event_type === 'web3' || 
          event.blockchain_tx_hash
        );
        
        console.log('🧪 Web3 events found in API response:', web3Events.length);
        web3Events.forEach((event, index) => {
          console.log(`🧪 Web3 Event ${index + 1}:`, {
            id: event.id,
            title: event.title,
            event_source: event.event_source,
            event_type: event.event_type,
            blockchain_tx_hash: event.blockchain_tx_hash,
            tier_prices: event.tier_prices,
            tier_quantities: event.tier_quantities
          });
        });
        
        // Test transformation on Web3 events
        if (web3Events.length > 0) {
          console.log('🧪 Testing transformation on Web3 events...');
          web3Events.forEach((event, index) => {
            const transformed = transformEventData(event);
            console.log(`🧪 Transformed Web3 Event ${index + 1}:`, transformed);
          });
        }
      }
    } catch (error) {
      console.error('🧪 Error testing Web3 event fetching:', error);
    }
  };
  
  // Enhanced fetch events with Web3-specific debugging
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Fetching events from backend API...');
      
      // Get all published events
      const response = await eventsAPI.getAll() as { events: any[] };
      
      console.log('📡 Backend API response:', response);
      
      if (response && response.events) {
        // Enhanced logging for Web3 event detection
        console.log('🔍 Raw backend events:', response.events);
        
        // Log Web3-specific fields for debugging
        response.events.forEach((event, index) => {
          console.log(`🔍 Event ${index + 1} Web3 fields:`, {
            id: event.id,
            title: event.title,
            event_source: event.event_source,
            event_type: event.event_type,
            blockchain_tx_hash: event.blockchain_tx_hash,
            tier_prices: event.tier_prices,
            tier_quantities: event.tier_quantities,
            hasWeb3Fields: !!(event.event_source === 'web3' || event.event_type === 'web3' || event.blockchain_tx_hash)
          });
        });
        
        const transformedEvents = response.events.map((event, index) => {
          const transformed = transformEventData(event);
          console.log(`🔍 Event ${index + 1} transformation:`, {
            original: event,
            transformed: transformed,
            isWeb3: transformed.isWeb3Event,
            tier: transformed.tier,
            price: transformed.price
          });
          return transformed;
        });
        
        console.log('🔍 Final transformed events:', transformedEvents);
        
        // Calculate Web3 event statistics with detailed breakdown
        const web3Events = transformedEvents.filter(e => e.isWeb3Event);
        const traditionalEvents = transformedEvents.filter(e => !e.isWeb3Event);
        
        const stats = {
          total: transformedEvents.length,
          web3: web3Events.length,
          traditional: traditionalEvents.length
        };
        
        console.log('📊 Web3 Event Statistics:', stats);
        
        // Log details about Web3 events found
        if (web3Events.length > 0) {
          console.log('🎉 Web3 Events Found:', web3Events.map(e => ({
            id: e.id,
            title: e.title,
            blockchainTxHash: e.blockchainTxHash,
            tierPrices: e.tierPrices,
            tierQuantities: e.tierQuantities
          })));
        } else {
          console.log('⚠️ No Web3 events found in the response');
        }
        
        setWeb3EventStats(stats);
        setEvents(transformedEvents);
      } else {
        // Handle case where response doesn't have events array
        console.warn('No events array in response:', response);
        setEvents([]);
      }
      
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
    
    // Test transformation function on mount
    testTransformation();
  }, [toast]);

  // Search events with backend API
  useEffect(() => {
    const searchEvents = async () => {
      if (!searchQuery.trim() && Object.values(filters).every(v => 
        v === "" || v === null || (Array.isArray(v) && v[0] === 0 && v[1] === 1000)
      )) {
        // No search query or filters, fetch all events
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const searchResponse = await searchAPI.searchEvents(searchQuery, filters) as any;
        if (searchResponse && searchResponse.success && searchResponse.events) {
          // Transform search results to frontend format
          const transformedEvents = searchResponse.events.map(transformEventData);
          setEvents(transformedEvents);
        } else {
          // Fallback to client-side filtering if backend search fails
          console.warn('Backend search failed, using client-side filtering');
          // You could implement client-side filtering here if needed
        }
      } catch (err) {
        console.error('❌ Error searching events:', err);
        // Fallback to client-side filtering on error
        console.warn('Using client-side filtering due to search error');
        // You could implement client-side filtering here if needed
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchEvents, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Reset search query when filters change
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
  };

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Reset filters when search changes
    if (Object.values(filters).some(v => v !== "" && v !== null && !(Array.isArray(v) && v[0] === 0 && v[1] === 1000))) {
      setFilters({
        location: "",
        category: "",
        language: "",
        type: "",
        priceRange: [0, 1000],
        dateRange: null
      });
    }
  };

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
            
            {/* Web3 Event Statistics */}
            {web3EventStats.total > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 max-w-2xl mx-auto">
                <div className="flex justify-center items-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{web3EventStats.total}</div>
                    <div className="text-gray-600">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{web3EventStats.web3}</div>
                    <div className="text-purple-600">Web3 Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{web3EventStats.traditional}</div>
                    <div className="text-blue-600">Traditional Events</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Debug Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={testWeb3EventFetching}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Test Web3 Fetching
              </button>
              <button
                onClick={testTransformation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Test Transformation
              </button>
            </div>
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
                  onFiltersChange={handleFiltersChange}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
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