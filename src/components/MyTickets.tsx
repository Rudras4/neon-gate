import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, QrCode, ExternalLink, ArrowUpRight, Wallet, Loader2, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { ticketsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";
import { ethers } from 'ethers';
import { TicketDisplay } from "./TicketDisplay";
import { TicketResaleModal } from "./TicketResaleModal";

export function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({});
  const [nftTickets, setNftTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isTicketDisplayOpen, setIsTicketDisplayOpen] = useState(false);
  const [resaleTicket, setResaleTicket] = useState<any>(null);
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { isConnected, account, connectWallet, currentNetwork } = useWallet();

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

  // Enhanced NFT fetching from blockchain
  const fetchUserNFTs = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to view NFT tickets",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingNFTs(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching NFT tickets for address:', account);
      console.log('🔍 Current network:', currentNetwork);
      
      // Get all events from EventFactory to find user's tickets
      const eventFactoryAddress = web3Service.getEventFactoryAddress();
      console.log('🔍 EventFactory address:', eventFactoryAddress);
      
      // This will be implemented in web3Service
      const userNFTs = await web3Service.getUserNFTTickets(account);
      console.log('🎫 User NFT tickets:', userNFTs);
      
      setNftTickets(userNFTs);
      
      // Generate QR codes for NFT tickets
      userNFTs.forEach((nft: any) => {
        generateQRCode(nft.tokenId.toString(), nft);
      });
      
      toast({
        title: "NFT Tickets Loaded",
        description: `Found ${userNFTs.length} NFT tickets on ${currentNetwork}`,
        variant: "default",
      });
      
    } catch (err) {
      console.error('Error fetching NFT tickets:', err);
      setError('Failed to load NFT tickets from blockchain');
      toast({
        title: "Error",
        description: "Failed to load NFT tickets from blockchain",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Fetch NFTs when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      fetchUserNFTs();
    }
  }, [isConnected, account]);

  // Open ticket display modal
  const openTicketDisplay = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsTicketDisplayOpen(true);
  };

  // Close ticket display modal
  const closeTicketDisplay = () => {
    setIsTicketDisplayOpen(false);
    setSelectedTicket(null);
  };

  // Handle successful resale listing
  const handleResaleSuccess = (listingId: string) => {
    toast({
      title: "Resale Listing Created!",
      description: `Your ticket is now available for resale. Listing ID: ${listingId}`,
      variant: "default",
    });
    // Refresh NFT tickets to show updated status
    setTimeout(() => fetchUserNFTs(), 2000);
  };

  // Combine traditional and NFT tickets
  const allTickets = [...tickets, ...nftTickets];
  const activeTickets = allTickets.filter(ticket => 
    ticket.status === "Active" || ticket.status === "active" || 
    (ticket.isNFT && new Date(ticket.eventDate) > new Date())
  );
  const pastTickets = allTickets.filter(ticket => 
    ticket.status === "Used" || ticket.status === "used" || 
    (ticket.isNFT && new Date(ticket.eventDate) <= new Date())
  );

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
            alt={ticket.eventTitle || ticket.eventName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{ticket.eventTitle || ticket.eventName}</h3>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${tierColors[ticket.tier as keyof typeof tierColors] || 'bg-gray-500'}`}>
                {ticket.tier}
              </div>
              {ticket.isNFT && (
                <Badge variant="outline" className="text-xs">
                  ⛓️ NFT
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{ticket.eventDate}</span>
            </div>
            {ticket.eventLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{ticket.eventLocation}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span><strong>Seat:</strong> {ticket.seatNumber || 'TBD'}</span>
            <span><strong>ID:</strong> {ticket.isNFT ? `NFT #${ticket.tokenId}` : ticket.id}</span>
            {ticket.isNFT && (
              <span><strong>Network:</strong> {ticket.network}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => openTicketDisplay(ticket)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Ticket
        </Button>
        
        {ticket.isNFT ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // View NFT on blockchain explorer
              const network = ticket.network;
              let explorerUrl = '';
              if (network === 'LOCALHOST') {
                explorerUrl = `http://localhost:8545/address/${ticket.eventContract}`;
              } else if (network === 'AVALANCHE_FUJI') {
                explorerUrl = `https://testnet.snowtrace.io/address/${ticket.eventContract}`;
              } else {
                explorerUrl = `https://etherscan.io/address/${ticket.eventContract}`;
              }
              window.open(explorerUrl, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on {ticket.network === 'LOCALHOST' ? 'Hardhat' : 'Explorer'}
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
        
        {showResaleOption && ticket.isNFT && (
          <TicketResaleModal
            ticket={ticket}
            isOpen={isResaleModalOpen && resaleTicket?.id === ticket.id}
            onClose={() => {
              setIsResaleModalOpen(false);
              setResaleTicket(null);
            }}
            onSuccess={handleResaleSuccess}
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setResaleTicket(ticket);
                setIsResaleModalOpen(true);
              }}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              List for Resale
            </Button>
          </TicketResaleModal>
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
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Badge variant="secondary">
                {allTickets.length} Total Tickets
              </Badge>
              <Badge variant="outline" className="text-green-600">
                ⛓️ {nftTickets.length} NFTs
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserNFTs}
                disabled={isLoadingNFTs}
              >
                {isLoadingNFTs ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Refresh NFTs
              </Button>
            </>
          ) : (
            <Button onClick={connectWallet} className="btn-hero">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet for NFTs
            </Button>
          )}
        </div>
      </div>

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Connect Your Wallet</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Connect your wallet to view and manage your NFT tickets on the blockchain
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error Loading NFTs</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserNFTs}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

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

      {/* Ticket Display Modal */}
      {selectedTicket && (
        <TicketDisplay
          ticket={selectedTicket}
          isOpen={isTicketDisplayOpen}
          onClose={closeTicketDisplay}
        />
      )}
    </div>
  );
}