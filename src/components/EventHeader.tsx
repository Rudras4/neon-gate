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
    <section className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 h-96">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.history.back()}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-end">
            {/* Event Info */}
            <div className="lg:col-span-2 text-white space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  {event.category}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {event.title}
              </h1>
              
              <p className="text-lg text-white/90 max-w-2xl">
                {event.description}
              </p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button 
                size="lg" 
                className="btn-hero flex-1"
              >
                Buy Ticket - {event.price} AVAX
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsLiked(!isLiked)}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}