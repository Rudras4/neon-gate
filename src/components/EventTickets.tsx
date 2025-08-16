import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, Star, Award } from "lucide-react";
import { useState } from "react";

interface Ticket {
  tier: string;
  price: string;
  available: number;
  total: number;
}

interface EventTicketsProps {
  tickets: Ticket[];
  eventId: string;
}

const tierIcons = {
  Platinum: Award,
  Gold: Star,
  Silver: Star,
  Bronze: Users,
};

const tierColors = {
  Platinum: "bg-gradient-to-r from-slate-400 to-slate-600",
  Gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
  Silver: "bg-gradient-to-r from-gray-300 to-gray-500",
  Bronze: "bg-gradient-to-r from-orange-400 to-orange-600",
};

export function EventTickets({ tickets, eventId }: EventTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const resaleTickets = [
    { id: "nft-001", seller: "0x1234...5678", price: "120", tier: "Gold", seatNumber: "A-15" },
    { id: "nft-002", seller: "0x9876...4321", price: "180", tier: "Platinum", seatNumber: "VIP-5" },
    { id: "nft-003", seller: "0x5555...9999", price: "80", tier: "Silver", seatNumber: "B-22" },
  ];

  return (
    <section className="py-12 bg-accent/5">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Get Your Tickets</h2>
          
          <Tabs defaultValue="organizer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="organizer">Buy from Organizer</TabsTrigger>
              <TabsTrigger value="resale">P2P Resale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="organizer" className="space-y-6">
              {/* Ticket Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket) => {
                  const Icon = tierIcons[ticket.tier as keyof typeof tierIcons] || Users;
                  const isSelected = selectedTicket === ticket.tier;
                  const isAvailable = ticket.available > 0;
                  
                  return (
                    <div
                      key={ticket.tier}
                      className={`card-elevated p-6 cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      } ${!isAvailable ? 'opacity-50' : ''}`}
                      onClick={() => isAvailable && setSelectedTicket(ticket.tier)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${tierColors[ticket.tier as keyof typeof tierColors]} flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{ticket.tier}</h3>
                            <p className="text-sm text-muted-foreground">
                              {ticket.available} of {ticket.total} available
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{ticket.price}</p>
                          <p className="text-sm text-muted-foreground">AVAX</p>
                        </div>
                      </div>
                      
                      {!isAvailable && (
                        <Badge variant="destructive" className="w-full justify-center">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Purchase Section */}
              {selectedTicket && (
                <div className="card-elevated p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Purchase {selectedTicket} Ticket</h3>
                  <div className="flex items-center justify-between">
                    <span>Price:</span>
                    <span className="text-xl font-bold text-primary">
                      {tickets.find(t => t.tier === selectedTicket)?.price} AVAX
                    </span>
                  </div>
                  <Button className="w-full btn-hero" size="lg">
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet & Buy
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your ticket will be minted as an NFT and transferred to your wallet
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resale" className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Buy verified NFT tickets from other attendees at market prices
                </p>
              </div>
              
              <div className="space-y-4">
                {resaleTickets.map((ticket) => (
                  <div key={ticket.id} className="card-elevated p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ticket.tier}</Badge>
                          <span className="font-medium">Seat {ticket.seatNumber}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          NFT ID: {ticket.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seller: {ticket.seller}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-2xl font-bold text-primary">{ticket.price}</p>
                          <p className="text-sm text-muted-foreground">AVAX</p>
                        </div>
                        <Button>Buy Now</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {resaleTickets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No resale tickets available at the moment</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}