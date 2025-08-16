import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, QrCode, ExternalLink, ArrowUpRight } from "lucide-react";

export function MyTickets() {
  // Mock ticket data
  const tickets = [
    {
      id: "nft-001",
      eventTitle: "Tech Conference 2024",
      eventDate: "March 15, 2024",
      eventLocation: "Convention Center, Mumbai",
      tier: "Gold",
      seatNumber: "A-15",
      price: "150",
      image: "/src/assets/hero-corporate.jpg",
      status: "Active",
      qrCode: "QR123456789"
    },
    {
      id: "nft-002",
      eventTitle: "EDM Night Festival",
      eventDate: "March 20, 2024",
      eventLocation: "Open Grounds, Pune",
      tier: "Platinum",
      seatNumber: "VIP-5",
      price: "75",
      image: "/src/assets/hero-concert.jpg",
      status: "Active",
      qrCode: "QR987654321"
    },
    {
      id: "nft-003",
      eventTitle: "Digital Marketing Workshop",
      eventDate: "February 25, 2024",
      eventLocation: "Business Hub, Bangalore",
      tier: "Silver",
      seatNumber: "B-22",
      price: "50",
      image: "/src/assets/venue-theater.jpg",
      status: "Used",
      qrCode: "QR555666777"
    }
  ];

  const activeTickets = tickets.filter(ticket => ticket.status === "Active");
  const pastTickets = tickets.filter(ticket => ticket.status === "Used");

  const tierColors = {
    Platinum: "bg-gradient-to-r from-slate-400 to-slate-600",
    Gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    Silver: "bg-gradient-to-r from-gray-300 to-gray-500",
    Bronze: "bg-gradient-to-r from-orange-400 to-orange-600",
  };

  const TicketCard = ({ ticket, showResaleOption = false }: { ticket: any, showResaleOption?: boolean }) => (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex gap-4">
        {/* Event Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={ticket.image}
            alt={ticket.eventTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{ticket.eventTitle}</h3>
            <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${tierColors[ticket.tier as keyof typeof tierColors]}`}>
              {ticket.tier}
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{ticket.eventDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{ticket.eventLocation}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span><strong>Seat:</strong> {ticket.seatNumber}</span>
            <span><strong>NFT ID:</strong> {ticket.id}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          Show QR
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View NFT
        </Button>
        {showResaleOption && (
          <Button variant="outline" size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            List for Resale
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Tickets</h2>
        <Badge variant="secondary">
          {tickets.length} Total NFTs
        </Badge>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Tickets ({activeTickets.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({pastTickets.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeTickets.length > 0 ? (
            activeTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} showResaleOption={true} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Tickets</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any upcoming events. Explore events to get your first NFT ticket!
              </p>
              <Button>
                <a href="/events">Explore Events</a>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastTickets.length > 0 ? (
            pastTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Past Events</h3>
              <p className="text-muted-foreground">
                Your attended events will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}