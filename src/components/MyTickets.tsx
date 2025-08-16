import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, QrCode, ExternalLink, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ticketsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';

export function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Generate QR codes for tickets
  const generateQRCode = async (ticketId: string, ticketData: any) => {
    try {
      const qrData = JSON.stringify({
        ticketId,
        eventTitle: ticketData.eventTitle,
        tier: ticketData.tier,
        seatNumber: ticketData.seatNumber,
        timestamp: new Date().toISOString()
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      setQrCodes(prev => ({ ...prev, [ticketId]: qrCodeDataUrl }));
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Fetch user tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await ticketsAPI.getUserTickets();
        const ticketsData = (response as any).tickets || [];
        setTickets(ticketsData);
        
        // Generate QR codes for all tickets
        ticketsData.forEach((ticket: any) => {
          generateQRCode(ticket.id, ticket);
        });
      } catch (err) {
        console.error('Error fetching tickets:', err);
        toast({
          title: "Error",
          description: "Failed to load tickets",
          variant: "destructive",
        });
        // Set empty array instead of mock data
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [toast]);

  const activeTickets = tickets.filter(ticket => ticket.status === "Active" || ticket.status === "active");
  const pastTickets = tickets.filter(ticket => ticket.status === "Used" || ticket.status === "used");

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
            src={ticket.image || "/src/assets/web3-features.jpg"}
            alt={ticket.eventTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{ticket.eventTitle}</h3>
            <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${tierColors[ticket.tier as keyof typeof tierColors] || 'bg-gray-500'}`}>
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
            <span><strong>Seat:</strong> {ticket.seatNumber || 'TBD'}</span>
            <span><strong>NFT ID:</strong> {ticket.id}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (qrCodes[ticket.id]) {
              // Show QR code in a modal or new window
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(`
                  <html>
                    <head><title>QR Code - ${ticket.eventTitle}</title></title>
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                      img { max-width: 300px; border: 1px solid #ccc; }
                      h1 { color: #333; }
                    </style>
                  </head>
                  <body>
                    <h1>${ticket.eventTitle}</h1>
                    <p><strong>${ticket.tier} Ticket</strong></p>
                    <p>Seat: ${ticket.seatNumber || 'TBD'}</p>
                    <img src="${qrCodes[ticket.id]}" alt="QR Code" />
                  </body>
                  </html>
                `);
              }
            }
          }}
        >
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Tickets</h2>
          <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-elevated p-6 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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