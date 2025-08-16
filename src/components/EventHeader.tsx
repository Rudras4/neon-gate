import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { useState } from "react";

interface EventHeaderProps {
  event: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
    price: string;
  };
}

export function EventHeader({ event }: EventHeaderProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <section className="relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4">
        {/* Back Button - Top Left */}
        <div className="absolute top-8 left-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>

        {/* Main Content - Centered */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
              {event.category}
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              {event.title.toUpperCase()}
            </h1>
          </div>
          
          {/* Event Details */}
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={() => {
                const ticketsSection = document.getElementById('tickets-section');
                ticketsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              BUY TICKETS
            </Button>
          </div>
        </div>

        {/* Action Buttons - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className="text-white hover:bg-white/20 transition-all duration-300"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-300"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}