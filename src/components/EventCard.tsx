import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: string;
  image: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  attendees: number;
  maxAttendees: number;
  isPopular?: boolean;
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
}: EventCardProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the Buy Ticket button
    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/events/${id}`);
  };
  const tierColors = {
    Platinum: "bg-gradient-to-r from-slate-400 to-slate-600",
    Gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    Silver: "bg-gradient-to-r from-gray-300 to-gray-500",
    Bronze: "bg-gradient-to-r from-orange-400 to-orange-600",
  };

  return (
    <div className="card-elevated group cursor-pointer" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isPopular && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="h-3 w-3 fill-current" />
            <span>Popular</span>
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
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{attendees > 0 ? `${attendees}/${maxAttendees}` : `${maxAttendees} capacity`} {attendees > 0 ? 'attending' : 'available'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-muted-foreground text-sm ml-1">₹</span>
          </div>
          <Button 
            className="btn-hero"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${id}`);
            }}
          >
            Buy Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}