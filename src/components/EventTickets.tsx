import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, Star, Award, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/lib/web3";

interface Ticket {
  tier: string;
  price: string;
  available: number;
  total: number;
}

interface ResaleTicket {
  id: string;
  seller: string;
  price: string;
  tier: string;
  seatNumber: string;
  status: string;
  listingId?: number;
  eventContract?: string;
  tokenId?: number;
}

interface EventTicketsProps {
  tickets: Ticket[];
  eventId: string;
  eventContractAddress?: string; // Web3 event contract address
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

export function EventTickets({ tickets, eventId, eventContractAddress }: EventTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [resaleTickets, setResaleTickets] = useState<ResaleTicket[]>([]);
  const [isLoadingResale, setIsLoadingResale] = useState(false);
  const [seatNumber, setSeatNumber] = useState<number>(1);
  
  const { toast } = useToast();
  const { 
    isConnected, 
    connectWallet, 
    purchaseTicket, 
    buyResaleTicket,
    isPurchasing, 
    account, 
    balance, 
    isLoading,
    currentNetwork
  } = useWallet();

  // Fetch resale tickets from blockchain
  useEffect(() => {
    if (eventContractAddress && isConnected) {
      fetchResaleTickets();
    }
  }, [eventContractAddress, isConnected]);

  const fetchResaleTickets = async () => {
    if (!eventContractAddress) return;
    
    setIsLoadingResale(true);
    try {
      const listings = await web3Service.getResaleListings(eventContractAddress);
      
      const formattedTickets: ResaleTicket[] = listings.map((listing: any) => ({
        id: listing.listingId,
        seller: listing.seller,
        price: listing.price,
        tier: "Unknown", // We'll need to fetch this from the ticket contract
        seatNumber: listing.tokenId.toString(),
        status: listing.isActive ? "available" : "sold",
        listingId: parseInt(listing.listingId),
        eventContract: listing.eventContract,
        tokenId: parseInt(listing.tokenId)
      }));
      
      setResaleTickets(formattedTickets);
    } catch (error) {
      console.error('Error fetching resale tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resale tickets from blockchain",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResale(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTicket || !eventContractAddress) return;
    
    const ticket = tickets.find(t => t.tier === selectedTicket);
    if (!ticket) return;

    try {
      setPurchaseStatus('idle');
      
      // Purchase ticket through smart contract
      const result = await purchaseTicket(
        eventContractAddress,
        selectedTicket,
        seatNumber,
        ticket.price
      );
      
      if (result.success) {
        setPurchaseStatus('success');
        setTxHash(result.txHash || null);
        
        toast({
          title: "Purchase Successful!",
          description: `Your ${selectedTicket} ticket has been minted as an NFT`,
          variant: "default",
        });
        
        // Reset after 5 seconds
        setTimeout(() => {
          setPurchaseStatus('idle');
          setSelectedTicket(null);
          setTxHash(null);
          setSeatNumber(1);
        }, 5000);
      } else {
        setPurchaseStatus('error');
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to purchase ticket",
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

  const handleResalePurchase = async (ticket: ResaleTicket) => {
    if (!ticket.listingId || !ticket.price) return;
    
    try {
      const result = await buyResaleTicket(ticket.listingId, ticket.price);
      
      if (result.success) {
        toast({
          title: "Resale Purchase Successful!",
          description: `Purchased ${ticket.tier} ticket for ${ticket.price} AVAX`,
          variant: "default",
        });
        
        // Update ticket status
        setResaleTickets(prev => 
          prev.map(t => 
            t.id === ticket.id ? { ...t, status: "sold" } : t
          )
        );
        
        // Refresh resale tickets
        setTimeout(() => fetchResaleTickets(), 2000);
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to purchase resale ticket",
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
  };

  return (
    <div id="tickets-section" className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Get Your Tickets</h2>
      
      {/* Web3 Status */}
      {eventContractAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Web3 Enabled</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Event Contract: {eventContractAddress.substring(0, 10)}...{eventContractAddress.substring(eventContractAddress.length - 8)}
          </p>
          <p className="text-xs text-blue-600">
            Network: {currentNetwork}
          </p>
        </div>
      )}
      
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
              
              {/* Seat Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Seat Number</label>
                <input
                  type="number"
                  min="1"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter seat number"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Price:</span>
                <span className="text-lg font-bold text-primary">
                  {tickets.find(t => t.tier === selectedTicket)?.price} AVAX
                </span>
              </div>
              
              {!eventContractAddress ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    This event is not yet available on blockchain
                  </p>
                </div>
              ) : !isConnected ? (
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
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Buy verified NFT tickets from other attendees at market prices
              </p>
            </div>
            {eventContractAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchResaleTickets}
                disabled={isLoadingResale}
              >
                {isLoadingResale ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </div>
          
          {!eventContractAddress ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Resale marketplace will be available once the event is deployed on blockchain
              </p>
            </div>
          ) : isLoadingResale ? (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
              <p className="text-sm text-muted-foreground mt-2">Loading resale tickets...</p>
            </div>
          ) : (
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
                        NFT ID: {ticket.tokenId || ticket.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Seller: {ticket.seller.substring(0, 6)}...{ticket.seller.substring(ticket.seller.length - 4)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-lg font-bold text-primary">{ticket.price}</p>
                        <p className="text-xs text-muted-foreground">AVAX</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleResalePurchase(ticket)}
                        disabled={ticket.status === "sold" || !isConnected}
                      >
                        {ticket.status === "sold" ? "Sold" : !isConnected ? "Connect Wallet" : "Buy Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {resaleTickets.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No resale tickets available at the moment</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}