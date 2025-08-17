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
    capacity?: string | number;
    status?: string;
    isWeb3Event?: boolean;
    blockchainTxHash?: string;
    eventSource?: string;
  };
}

export function EventInfo({ event }: EventInfoProps) {
  // Enhanced info items with real data validation
  const infoItems = [
    { icon: Calendar, label: "Date", value: event.date || "TBD" },
    { icon: Clock, label: "Time", value: event.time || "TBD" },
    { icon: Clock, label: "Duration", value: event.duration || "TBD" },
    { icon: MapPin, label: "Location", value: event.location || "TBD" },
    { icon: Globe, label: "Language", value: event.language || "English" },
    { icon: Users, label: "Type", value: event.type || "In-person" },
    { icon: Tag, label: "Category", value: event.category || "Event" },
    { icon: Shield, label: "Age Limit", value: event.ageLimit || "18+" },
  ];

  // Add capacity if available
  if (event.capacity && event.capacity !== "Unlimited") {
    infoItems.push({ icon: Users, label: "Capacity", value: event.capacity.toString() });
  }

  // Add status if available
  if (event.status && event.status !== "published") {
    infoItems.push({ icon: Shield, label: "Status", value: event.status });
  }

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

      {/* Enhanced Price Display */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">Starting from</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-primary">₹{event.price}</span>
          <span className="text-lg text-muted-foreground">
            {event.isWeb3Event ? 'Web3' : 'Traditional'}
          </span>
        </div>
        
        {/* Web3 Event Indicator */}
        {event.isWeb3Event && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium">Web3 Event</span>
            </div>
            {event.blockchainTxHash && (
              <p className="text-xs text-blue-600 mt-1">
                TX: {event.blockchainTxHash.substring(0, 10)}...{event.blockchainTxHash.substring(event.blockchainTxHash.length - 8)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}