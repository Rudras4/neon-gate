import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, Star, Award, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ticketsAPI, paymentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { isConnected, connectWallet, purchaseTicket, isPurchasing, account, balance, isLoading } = useWallet();

  const [resaleTickets, setResaleTickets] = useState([
    { id: "nft-001", seller: "0x1234...5678", price: "120", tier: "Gold", seatNumber: "A-15", status: "available" },
    { id: "nft-002", seller: "0x9876...4321", price: "180", tier: "Platinum", seatNumber: "VIP-5", status: "available" },
    { id: "nft-003", seller: "0x5555...9999", price: "80", tier: "Silver", seatNumber: "B-22", status: "available" },
  ]);

  // Fetch resale tickets from backend
  useEffect(() => {
    const fetchResaleTickets = async () => {
      try {
        const response = await ticketsAPI.getResaleTickets(eventId) as any;
        if (response && response.success) {
          setResaleTickets(response.tickets || []);
        } else {
          // Keep existing mock data if API fails
          console.warn('Failed to fetch resale tickets, using fallback data');
        }
      } catch (error) {
        console.error('Error fetching resale tickets:', error);
        // Keep existing mock data on error
      }
    };

    fetchResaleTickets();
  }, [eventId]);

  const handlePurchase = async () => {
    if (!selectedTicket) return;
    
    const ticket = tickets.find(t => t.tier === selectedTicket);
    if (!ticket) return;

    try {
      // Create payment intent first
      const paymentIntent = await paymentsAPI.createPaymentIntent({
        eventId: eventId,
        ticketData: {
          tier: selectedTicket,
          price: ticket.price,
          quantity: 1
        },
        amount: ticket.price,
        currency: 'AVAX'
      }) as any;

      if (!paymentIntent.success) {
        toast({
          title: "Payment Failed",
          description: paymentIntent.error || "Failed to create payment intent",
          variant: "destructive",
        });
        setPurchaseStatus('error');
        setTimeout(() => setPurchaseStatus('idle'), 3000);
        return;
      }

      // First, purchase ticket through backend
      const ticketData = {
        eventId: eventId,
        tier: selectedTicket,
        price: ticket.price,
        quantity: 1
      };

      const backendResult = await ticketsAPI.purchaseTicket(eventId, ticketData) as any;
       
      if (backendResult?.success) {
        // Confirm payment
        await paymentsAPI.confirmPayment(paymentIntent.paymentIntentId, {
          method: 'blockchain',
          transactionHash: 'pending'
        });

        // Then proceed with blockchain purchase
        const result = await purchaseTicket(selectedTicket, ticket.price);
        
        if (result.success) {
          // Update payment with transaction hash
          await paymentsAPI.confirmPayment(paymentIntent.paymentIntentId, {
            method: 'blockchain',
            transactionHash: result.txHash || 'completed'
          });

          setPurchaseStatus('success');
          setTxHash(result.txHash || null);
          // Reset after 5 seconds
          setTimeout(() => {
            setPurchaseStatus('idle');
            setSelectedTicket(null);
            setTxHash(null);
          }, 5000);
        } else {
          setPurchaseStatus('error');
          setTimeout(() => setPurchaseStatus('idle'), 3000);
        }
      } else {
        setPurchaseStatus('error');
        toast({
          title: "Purchase Failed",
          description: backendResult?.error || "Failed to purchase ticket",
          variant: "destructive",
        });
        setTimeout(() => setPurchaseStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Ticket purchase error:', error);
      setPurchaseStatus('error');
      toast({
        title: "Purchase Failed",
        description: "An error occurred while purchasing the ticket",
        variant: "destructive",
      });
      setTimeout(() => setPurchaseStatus('idle'), 3000);
    }
  };

  return (
    <div id="tickets-section" className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Get Your Tickets</h2>
      
      <Tabs defaultValue="organizer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizer">Buy from Organizer</TabsTrigger>
          <TabsTrigger value="resale">P2P Resale</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organizer" className="space-y-4">
          {/* Ticket Tiers */}
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const Icon = tierIcons[ticket.tier as keyof typeof tierIcons] || Users;
              const isSelected = selectedTicket === ticket.tier;
              const isAvailable = ticket.available > 0;
              
              return (
                <div
                  key={ticket.tier}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${!isAvailable ? 'opacity-50' : ''}`}
                  onClick={() => isAvailable && setSelectedTicket(ticket.tier)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${tierColors[ticket.tier as keyof typeof tierColors]} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{ticket.tier}</h3>
                        <p className="text-xs text-muted-foreground">
                          {ticket.available} of {ticket.total} available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{ticket.price}</p>
                      <p className="text-xs text-muted-foreground">AVAX</p>
                    </div>
                  </div>
                  
                  {!isAvailable && (
                    <Badge variant="destructive" className="w-full justify-center mt-2">
                      Sold Out
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Purchase Section */}
          {selectedTicket && (
            <div id="tickets-section" className="bg-card border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold">Purchase {selectedTicket} Ticket</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Price:</span>
                <span className="text-lg font-bold text-primary">
                  {tickets.find(t => t.tier === selectedTicket)?.price} AVAX
                </span>
              </div>
              {!isConnected ? (
                <Button 
                  onClick={connectWallet} 
                  disabled={isLoading}
                  className="w-full btn-hero"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : purchaseStatus === 'success' ? (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Purchase Successful!</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Your NFT ticket has been minted</p>
                    {txHash && (
                      <p className="break-all mt-1">
                        TX: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                      </p>
                    )}
                  </div>
                </div>
              ) : purchaseStatus === 'error' ? (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Purchase Failed</span>
                  </div>
                  <Button 
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full btn-hero"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handlePurchase}
                  disabled={isPurchasing || !selectedTicket}
                  className="w-full btn-hero"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Buy Ticket
                    </>
                  )}
                </Button>
              )}
              
              {/* Wallet Info */}
              {isConnected && account && (
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
                  {balance && <p>Balance: {parseFloat(balance).toFixed(4)} AVAX</p>}
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Your ticket will be minted as an NFT and transferred to your wallet
              </p>
            </div>
          )}
        </TabsContent>
            
        <TabsContent value="resale" className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Buy verified NFT tickets from other attendees at market prices
            </p>
          </div>
          
          <div className="space-y-3">
            {resaleTickets.map((ticket) => (
              <div key={ticket.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{ticket.tier}</Badge>
                      <span className="text-sm font-medium">Seat {ticket.seatNumber}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      NFT ID: {ticket.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Seller: {ticket.seller}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-lg font-bold text-primary">{ticket.price}</p>
                      <p className="text-xs text-muted-foreground">AVAX</p>
                    </div>
                                         <Button 
                       size="sm"
                       onClick={async () => {
                         try {
                           // Purchase resale ticket through backend
                           const resaleData = {
                             ticketId: ticket.id,
                             eventId: eventId,
                             seller: ticket.seller,
                             price: ticket.price,
                             tier: ticket.tier
                           };
                           
                                                       // Purchase resale ticket through backend
                            const result = await ticketsAPI.purchaseResaleTicket(ticket.id, resaleData) as any;
                            
                            if (result && result.success) {
                              toast({
                                title: "Resale Purchase Successful",
                                description: `Purchased ${ticket.tier} ticket from ${ticket.seller} for ${ticket.price} AVAX`,
                              });
                              
                              // Update ticket status
                              setResaleTickets(prev => 
                                prev.map(t => 
                                  t.id === ticket.id ? { ...t, status: "sold" } : t
                                )
                              );
                            } else {
                              toast({
                                title: "Purchase Failed",
                                description: result?.error || "Failed to purchase resale ticket",
                                variant: "destructive",
                              });
                            }
                         } catch (error) {
                           toast({
                             title: "Purchase Failed",
                             description: "Failed to purchase resale ticket",
                             variant: "destructive",
                           });
                         }
                       }}
                       disabled={ticket.status === "sold"}
                     >
                       {ticket.status === "sold" ? "Sold" : "Buy Now"}
                     </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {resaleTickets.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No resale tickets available at the moment</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}