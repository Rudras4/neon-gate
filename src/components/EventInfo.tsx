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
    <section className="py-12 bg-accent/5">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Event Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infoItems.map((item, index) => (
              <div key={index} className="card-elevated p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-semibold">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Starting Price Highlight */}
          <div className="mt-8 text-center">
            <div className="inline-block card-elevated p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Starting from</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-primary">{event.price}</span>
                <span className="text-lg text-muted-foreground">AVAX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}