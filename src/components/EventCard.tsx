import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

interface EventCardProps {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: string;
  image: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze" | "Web3";
  attendees: number;
  maxAttendees: number;
  isPopular?: boolean;
  // Web3-specific properties
  isWeb3Event?: boolean;
  blockchainTxHash?: string;
  eventSource?: string;
  tierPrices?: string;
  tierQuantities?: string;
  onInteraction?: (eventId: string, action: 'view' | 'click' | 'favorite') => void;
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  price,
  image,
  tier,
  attendees,
  maxAttendees,
  isPopular = false,
  // Web3-specific properties
  isWeb3Event = false,
  blockchainTxHash,
  eventSource,
  tierPrices,
  tierQuantities,
  onInteraction,
}: EventCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // Track when card comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onInteraction && id) {
            onInteraction(id, 'view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [id, onInteraction]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the Buy Ticket button
    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Track interaction
    if (onInteraction && id) {
      onInteraction(id, 'click');
    }
    
    navigate(`/events/${id}`);
  };

  const tierColors = {
    Platinum: "bg-gradient-to-r from-slate-400 to-slate-600",
    Gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    Silver: "bg-gradient-to-r from-gray-300 to-gray-500",
    Bronze: "bg-gradient-to-r from-orange-400 to-orange-600",
    Web3: "bg-gradient-to-r from-purple-500 to-blue-600",
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format price for display
  const formatPrice = (priceString: string) => {
    const price = parseFloat(priceString);
    if (isNaN(price)) return "Free";
    if (price === 0) return "Free";
    return `₹${price.toFixed(2)}`;
  };

  // Handle missing image with fallback
  const imageSrc = image || "/src/assets/hero-corporate.jpg";

  return (
    <div ref={cardRef} className="card-elevated group cursor-pointer" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to placeholder image if main image fails to load
            (e.target as HTMLImageElement).src = "/src/assets/hero-corporate.jpg";
          }}
        />
        {isPopular && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="h-3 w-3 fill-current" />
            <span>Popular</span>
          </div>
        )}
        
        {/* Web3 Event Indicator */}
        {isWeb3Event && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-600 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <span>⛓️</span>
            <span>Web3</span>
          </div>
        )}
        
        <div className={`absolute top-3 right-3 ${tierColors[tier]} text-white px-2 py-1 rounded-full text-xs font-medium`}>
          {tier}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location || "Location TBD"}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {attendees > 0 ? `${attendees}/${maxAttendees}` : `${maxAttendees} capacity`} 
              {attendees > 0 ? ' attending' : ' available'}
            </span>
          </div>
          
          {/* Web3-specific information */}
          {isWeb3Event && blockchainTxHash && (
            <div className="flex items-center space-x-2 text-purple-600 text-xs">
              <span>🔗</span>
              <span className="font-mono">
                {blockchainTxHash.substring(0, 6)}...{blockchainTxHash.substring(blockchainTxHash.length - 4)}
              </span>
            </div>
          )}
          
          {isWeb3Event && tierPrices && (
            <div className="flex items-center space-x-2 text-blue-600 text-xs">
              <span>💰</span>
              <span>Multiple pricing tiers available</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
            {price !== "Free" && <span className="text-muted-foreground text-sm ml-1">₹</span>}
          </div>
          <Button 
            className={`btn-hero ${isWeb3Event ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              
              // Track interaction
              if (onInteraction && id) {
                onInteraction(id, 'click');
              }
              
              navigate(`/events/${id}`);
            }}
          >
            {isWeb3Event ? 'View Web3 Event' : 'Buy Ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}