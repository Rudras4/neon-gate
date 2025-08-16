import { EventCard } from "@/components/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

interface EventGridProps {
  searchQuery: string;
  filters: any;
}

const mockEvents = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Join industry leaders for cutting-edge insights into technology trends and innovations shaping the future.",
    date: "March 15, 2024",
    location: "Convention Center, Mumbai",
    price: "150",
    image: "/src/assets/hero-corporate.jpg",
    tier: "Gold" as const,
    attendees: 234,
    maxAttendees: 500,
    isPopular: true,
    category: "Conference",
    language: "English",
    type: "In-person"
  },
  {
    id: "2",
    title: "EDM Night Festival",
    description: "Dance the night away with top DJs and electronic music artists in an unforgettable experience.",
    date: "March 20, 2024",
    location: "Open Grounds, Pune",
    price: "75",
    image: "/src/assets/hero-concert.jpg",
    tier: "Platinum" as const,
    attendees: 1200,
    maxAttendees: 2000,
    isPopular: true,
    category: "Concert",
    language: "English",
    type: "In-person"
  },
  {
    id: "3",
    title: "Digital Marketing Workshop",
    description: "Learn practical strategies and tools for modern digital marketing from industry experts.",
    date: "March 25, 2024",
    location: "Business Hub, Bangalore",
    price: "50",
    image: "/src/assets/venue-theater.jpg",
    tier: "Silver" as const,
    attendees: 45,
    maxAttendees: 100,
    category: "Workshop",
    language: "English",
    type: "Hybrid"
  },
  {
    id: "4",
    title: "Stand-up Comedy Night",
    description: "Laugh out loud with the best comedians in town performing their latest material.",
    date: "March 30, 2024",
    location: "Comedy Club, Delhi",
    price: "25",
    image: "/src/assets/web3-features.jpg",
    tier: "Bronze" as const,
    attendees: 80,
    maxAttendees: 150,
    category: "Comedy",
    language: "Hindi",
    type: "In-person"
  },
  {
    id: "5",
    title: "Food Festival 2024",
    description: "Taste cuisines from around the world with over 100 food stalls and cooking demonstrations.",
    date: "April 5, 2024",
    location: "City Park, Chennai",
    price: "30",
    image: "/src/assets/hero-corporate.jpg",
    tier: "Gold" as const,
    attendees: 500,
    maxAttendees: 1000,
    category: "Festival",
    language: "Tamil",
    type: "In-person"
  },
  {
    id: "6",
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to investors and industry leaders.",
    date: "April 10, 2024",
    location: "Tech Hub, Hyderabad",
    price: "100",
    image: "/src/assets/venue-theater.jpg",
    tier: "Platinum" as const,
    attendees: 200,
    maxAttendees: 300,
    category: "Conference",
    language: "English",
    type: "Online"
  }
];

export function EventGrid({ searchQuery, filters }: EventGridProps) {
  const [sortBy, setSortBy] = useState("date");

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    // First filter events
    let filtered = mockEvents.filter((event) => {
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Location filter
      if (filters.location && !event.location.includes(filters.location)) {
        return false;
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Language filter
      if (filters.language && event.language !== filters.language) {
        return false;
      }

      // Type filter
      if (filters.type && event.type !== filters.type) {
        return false;
      }

      // Price filter
      const eventPrice = parseInt(event.price);
      if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
        return false;
      }

      return true;
    });

    // Then sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return parseInt(a.price) - parseInt(b.price);
        case "popularity":
          return b.attendees - a.attendees;
        case "date":
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy]);

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
          {filteredAndSortedEvents.map((event) => (
            <div key={event.id}>
              <EventCard {...event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">🎪</span>
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