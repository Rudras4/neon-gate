import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, Star, Award, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/lib/web3";
import { TicketDisplay } from "./TicketDisplay";

interface Ticket {
  tier: string;
  price: string;
  available: number;
  total: number;
  originalIndex?: number; // For Web3 events to track tier order
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
  metadata?: any;
  listingDate?: string;
}

interface EventTicketsProps {
  tickets: Ticket[];
  eventId: string;
  eventContractAddress?: string; // Web3 event contract address
  isWeb3Event?: boolean; // Whether this is a Web3 event
  blockchainTxHash?: string; // Blockchain transaction hash for Web3 events
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

export function EventTickets({ tickets, eventId, eventContractAddress, isWeb3Event, blockchainTxHash }: EventTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [resaleTickets, setResaleTickets] = useState<ResaleTicket[]>([]);
  const [isLoadingResale, setIsLoadingResale] = useState(false);
  const [seatNumber, setSeatNumber] = useState<number>(1);
  const [ticketDisplayData, setTicketDisplayData] = useState<any>(null);
  const [isTicketDisplayOpen, setIsTicketDisplayOpen] = useState(false);
  
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

  // Enhanced ticket validation and debugging
  useEffect(() => {
    console.log('🎫 EventTickets received tickets:', tickets);
    console.log('🎫 EventTickets props:', { eventId, eventContractAddress, isWeb3Event, blockchainTxHash });
    
    // Validate ticket data
    if (tickets && tickets.length > 0) {
      tickets.forEach((ticket, index) => {
        console.log(`🎫 Ticket ${index + 1}:`, {
          tier: ticket.tier,
          price: ticket.price,
          available: ticket.available,
          total: ticket.total,
          isValid: ticket.price && ticket.available > 0 && ticket.total > 0
        });
      });
    } else {
      console.warn('⚠️ No tickets received or empty tickets array');
    }
  }, [tickets, eventId, eventContractAddress, isWeb3Event, blockchainTxHash]);

  // Open ticket display for purchased tickets
  const openTicketDisplay = (ticketData: any) => {
    // Create a mock ticket object for display (since this is for purchase preview)
    const displayTicket = {
      eventTitle: ticketData.eventName || 'Event',
      eventName: ticketData.eventName || 'Event',
      tier: ticketData.tier,
      seatNumber: seatNumber,
      eventDate: new Date().toLocaleDateString(),
      eventLocation: 'Event Venue',
      isNFT: isWeb3Event,
      network: currentNetwork,
      eventContract: eventContractAddress,
      tokenId: 'Preview',
      owner: account,
      purchaseDate: new Date().toLocaleDateString(),
      metadataURI: 'Preview metadata'
    };
    
    setTicketDisplayData(displayTicket);
    setIsTicketDisplayOpen(true);
  };

  // Close ticket display
  const closeTicketDisplay = () => {
    setIsTicketDisplayOpen(false);
    setTicketDisplayData(null);
  };

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
      console.log('🔍 Fetching resale tickets for event:', eventContractAddress);
      
      const listings = await web3Service.getResaleListings(eventContractAddress);
      console.log('📋 Raw resale listings:', listings);
      
      // Enhanced ticket formatting with better data mapping
      const formattedTickets: ResaleTicket[] = await Promise.all(
        listings.map(async (listing: any) => {
          try {
            // Try to get ticket metadata from the blockchain
            let ticketMetadata = null;
            try {
              ticketMetadata = await web3Service.getTicketMetadata(
                eventContractAddress,
                listing.tokenId
              );
            } catch (metadataError) {
              console.log('⚠️ Could not fetch ticket metadata:', metadataError);
            }
            
            // Determine tier from metadata or fallback to seat-based logic
            let tier = "Standard";
            if (ticketMetadata && ticketMetadata.tier) {
              tier = ticketMetadata.tier;
            } else {
              // Fallback tier determination based on seat number
              const seatNum = parseInt(listing.tokenId);
              if (seatNum <= 10) tier = "Platinum";
              else if (seatNum <= 25) tier = "Gold";
              else if (seatNum <= 50) tier = "Silver";
              else tier = "Bronze";
            }
            
            return {
              id: listing.listingId?.toString() || `listing-${Date.now()}`,
              seller: listing.seller || listing.owner || 'Unknown',
              price: listing.price || listing.askingPrice || '0',
              tier: tier,
              seatNumber: listing.tokenId?.toString() || 'Unknown',
              status: listing.isActive ? "available" : "sold",
              listingId: parseInt(listing.listingId) || 0,
              eventContract: listing.eventContract || eventContractAddress,
              tokenId: parseInt(listing.tokenId) || 0,
              metadata: ticketMetadata,
              listingDate: listing.listingDate || new Date().toISOString()
            };
          } catch (ticketError) {
            console.error('❌ Error formatting ticket:', ticketError);
            // Return a fallback ticket object
            return {
              id: `fallback-${Date.now()}`,
              seller: listing.seller || 'Unknown',
              price: listing.price || '0',
              tier: "Standard",
              seatNumber: listing.tokenId?.toString() || 'Unknown',
              status: "available",
              listingId: 0,
              eventContract: eventContractAddress,
              tokenId: parseInt(listing.tokenId) || 0
            };
          }
        })
      );
      
      console.log('✅ Formatted resale tickets:', formattedTickets);
      setResaleTickets(formattedTickets);
      
      if (formattedTickets.length > 0) {
        toast({
          title: "Resale Tickets Found",
          description: `Found ${formattedTickets.length} tickets available for resale`,
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('❌ Error fetching resale tickets:', error);
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

  const getNetworkCurrency = (): string => {
    switch (currentNetwork) {
      case 'LOCALHOST':
        return 'ETH';
      case 'AVALANCHE_FUJI':
        return 'AVAX';
      case 'SEPOLIA':
        return 'ETH';
      default:
        return 'ETH';
    }
  };

  const handleResalePurchase = async (ticket: ResaleTicket) => {
    if (!ticket.listingId || !ticket.price) return;
    
    try {
      const result = await buyResaleTicket(ticket.listingId, ticket.price);
      
      if (result.success) {
        toast({
          title: "Resale Purchase Successful!",
          description: `Purchased ${ticket.tier} ticket for ${ticket.price} ${getNetworkCurrency()}`,
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
      
      {/* Enhanced Web3 Status */}
      {(eventContractAddress || isWeb3Event) && (
        <div className={`border rounded-lg p-4 ${
          eventContractAddress 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {eventContractAddress ? 'Web3 Enabled' : 'Web3 Event'}
            </span>
          </div>
          {eventContractAddress && (
            <>
              <p className="text-xs text-blue-600 mt-1">
                Event Contract: {eventContractAddress.substring(0, 10)}...{eventContractAddress.substring(eventContractAddress.length - 8)}
              </p>
              <p className="text-xs text-blue-600">
                Network: {currentNetwork}
              </p>
            </>
          )}
          {blockchainTxHash && (
            <p className="text-xs text-blue-600 mt-1">
              TX Hash: {blockchainTxHash.substring(0, 10)}...{blockchainTxHash.substring(blockchainTxHash.length - 8)}
            </p>
          )}
          {isWeb3Event && !eventContractAddress && (
            <p className="text-xs text-purple-600 mt-1">
              ⚠️ Event created via Web3 but contract not yet deployed
            </p>
          )}
        </div>
      )}
      
      <Tabs defaultValue="organizer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizer">Buy from Organizer</TabsTrigger>
          <TabsTrigger value="resale">P2P Resale</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organizer" className="space-y-4">
          {/* Enhanced Ticket Tiers with Real Data */}
          <div className="space-y-3">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket) => {
                const Icon = tierIcons[ticket.tier as keyof typeof tierIcons] || Users;
                const isSelected = selectedTicket === ticket.tier;
                const isAvailable = ticket.available > 0;
                const isWeb3Ticket = isWeb3Event && ticket.originalIndex !== undefined;
                
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
                          {isWeb3Ticket && (
                            <p className="text-xs text-blue-600">
                              Tier {ticket.originalIndex + 1} • Web3
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">₹{ticket.price}</p>
                        <p className="text-xs text-muted-foreground">
                          {isWeb3Event ? 'Web3 Price' : 'Traditional Price'}
                        </p>
                      </div>
                    </div>
                    
                    {!isAvailable && (
                      <Badge variant="destructive" className="w-full justify-center mt-2">
                        Sold Out
                      </Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">No Tickets Available</h3>
                <p className="text-xs text-muted-foreground">
                  {isWeb3Event 
                    ? 'Web3 event tickets not yet configured' 
                    : 'Traditional event tickets not yet configured'
                  }
                </p>
              </div>
            )}
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
                  ₹{tickets.find(t => t.tier === selectedTicket)?.price}
                </span>
              </div>
              
              {/* Enhanced ticket info */}
              {(() => {
                const selectedTicketData = tickets.find(t => t.tier === selectedTicket);
                if (selectedTicketData) {
                  return (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• {selectedTicketData.available} tickets remaining</p>
                      {isWeb3Event && selectedTicketData.originalIndex !== undefined && (
                        <p>• Web3 Tier {selectedTicketData.originalIndex + 1}</p>
                      )}
                      {!isWeb3Event && (
                        <p>• Traditional Event Ticket</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Preview Ticket Button */}
              <Button
                variant="outline"
                onClick={() => openTicketDisplay(tickets.find(t => t.tier === selectedTicket))}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Ticket
              </Button>
              
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
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">P2P Resale Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Buy verified NFT tickets from other attendees at market prices
              </p>
              {resaleTickets.length > 0 && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📊 {resaleTickets.length} tickets available</span>
                  <span>💰 Price range: {Math.min(...resaleTickets.map(t => parseFloat(t.price) || 0)).toFixed(4)} - {Math.max(...resaleTickets.map(t => parseFloat(t.price) || 0)).toFixed(4)} {getNetworkCurrency()}</span>
                </div>
              )}
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
                     <div className="space-y-2 flex-1">
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-xs">{ticket.tier}</Badge>
                         <span className="text-sm font-medium">Seat {ticket.seatNumber}</span>
                         {ticket.metadata && (
                           <Badge variant="secondary" className="text-xs">
                             ⛓️ NFT #{ticket.tokenId}
                           </Badge>
                         )}
                       </div>
                       
                       <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">
                           Seller: {ticket.seller.substring(0, 6)}...{ticket.seller.substring(ticket.seller.length - 4)}
                         </p>
                         {ticket.listingDate && (
                           <p className="text-xs text-muted-foreground">
                             Listed: {new Date(ticket.listingDate).toLocaleDateString()}
                           </p>
                         )}
                         {ticket.metadata && ticket.metadata.description && (
                           <p className="text-xs text-muted-foreground">
                             {ticket.metadata.description}
                           </p>
                         )}
                       </div>
                     </div>
                     
                     <div className="text-right space-y-3 ml-4">
                       <div className="space-y-1">
                         <p className="text-lg font-bold text-primary">
                           {ticket.price} {getNetworkCurrency()}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {ticket.metadata && ticket.metadata.originalPrice ? 
                             `Original: ${ticket.metadata.originalPrice}` : 
                             'Market Price'
                           }
                         </p>
                       </div>
                       
                       <div className="space-y-2">
                         {ticket.status === "sold" ? (
                           <Badge variant="destructive" className="w-full justify-center">
                             Sold
                           </Badge>
                         ) : !isConnected ? (
                           <Button 
                             size="sm" 
                             variant="outline"
                             onClick={connectWallet}
                             className="w-full"
                           >
                             <Wallet className="h-3 w-3 mr-1" />
                             Connect
                           </Button>
                         ) : (
                           <Button 
                             size="sm"
                             onClick={() => handleResalePurchase(ticket)}
                             className="w-full btn-hero"
                           >
                             <ArrowUpRight className="h-3 w-3 mr-1" />
                             Buy Now
                           </Button>
                         )}
                         
                         {/* View Ticket Details Button */}
                         <Button 
                           size="sm" 
                           variant="ghost"
                           onClick={() => openTicketDisplay({
                             eventTitle: 'Resale Ticket',
                             eventName: 'Resale Ticket',
                             tier: ticket.tier,
                             seatNumber: ticket.seatNumber,
                             eventDate: new Date().toLocaleDateString(),
                             eventLocation: 'Event Venue',
                             isNFT: true,
                             network: currentNetwork,
                             eventContract: ticket.eventContract,
                             tokenId: ticket.tokenId,
                             owner: ticket.seller,
                             purchaseDate: ticket.listingDate ? new Date(ticket.listingDate).toLocaleDateString() : 'Unknown',
                             metadataURI: ticket.metadata?.uri || 'No metadata'
                           })}
                           className="w-full text-xs"
                         >
                           <Eye className="h-3 w-3 mr-1" />
                           View Details
                         </Button>
                       </div>
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

      {/* Ticket Display Modal */}
      {ticketDisplayData && (
        <TicketDisplay
          ticket={ticketDisplayData}
          isOpen={isTicketDisplayOpen}
          onClose={closeTicketDisplay}
        />
      )}
    </div>
  );
}