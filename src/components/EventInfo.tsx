import { Calendar, Clock, MapPin, Globe, Users, Tag, Shield } from "lucide-react";

interface EventInfoProps {
  event: {
    date: string;
    time: string;
    duration: string;
    location: string;
    language: string;
    type: string;
    category: string;
    ageLimit: string;
    price: string;
  };
}

export function EventInfo({ event }: EventInfoProps) {
  const infoItems = [
    { icon: Calendar, label: "Date", value: event.date },
    { icon: Clock, label: "Time", value: event.time },
    { icon: Clock, label: "Duration", value: event.duration },
    { icon: MapPin, label: "Location", value: event.location },
    { icon: Globe, label: "Language", value: event.language },
    { icon: Users, label: "Type", value: event.type },
    { icon: Tag, label: "Category", value: event.category },
    { icon: Shield, label: "Age Limit", value: event.ageLimit },
  ];

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">Event Information</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {infoItems.map((item, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-foreground break-words">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Starting Price Highlight */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">Starting from</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-primary">{event.price}</span>
          <span className="text-lg text-muted-foreground">AVAX</span>
        </div>
      </div>
    </div>
  );
}