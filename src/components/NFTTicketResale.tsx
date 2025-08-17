import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

interface NFTTicketResaleProps {
  eventContractAddress: string;
  tickets: Array<{
    tier: string;
    price: string;
    available: number;
    total: number;
    originalIndex?: number;
  }>;
  eventId: string;
  isWeb3Event: boolean;
}

interface ResaleListing {
  listingId: number;
  eventContract: string;
  tokenId: number;
  seller: string;
  price: string;
  isActive: boolean;
  ticketTier?: string;
  sellerName?: string;
}

export const NFTTicketResale: React.FC<NFTTicketResaleProps> = ({
  eventContractAddress,
  tickets,
  eventId,
  isWeb3Event
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'list'>('browse');
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resalePrice, setResalePrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  
  const { toast } = useToast();
  const { isConnected, currentNetwork, account, provider } = useWallet();

  // Contract ABIs
  const eventTicketABI = [
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function getTicket(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 seatNumber, string tier, string metadataURI, address owner, bool exists))",
    "function getUserTickets(address user) external view returns (uint256[])",
    "function approve(address to, uint256 tokenId) external",
    "function getApproved(uint256 tokenId) external view returns (address)"
  ];

  const ticketResaleABI = [
    "function listings(uint256 listingId) external view returns (tuple(uint256 listingId, address eventContract, uint256 tokenId, address seller, uint256 price, bool isActive))",
    "function listTicketForResale(address eventContract, uint256 tokenId, uint256 price) external returns (uint256)",
    "function buyResaleTicket(uint256 listingId) external payable",
    "function getActiveListings() external view returns (uint256[])",
    "function getListingCount() external view returns (uint256)"
  ];

  useEffect(() => {
    if (isWeb3Event && eventContractAddress && provider) {
      fetchListings();
      if (isConnected) {
        fetchUserTickets();
      }
    }
  }, [isWeb3Event, eventContractAddress, provider, isConnected]);

  const fetchListings = async () => {
    if (!provider) return;
    
    setIsLoadingListings(true);
    try {
      const signer = await provider.getSigner();
      const resaleContract = new ethers.Contract(
        '0x0000000000000000000000000000000000000000', // TODO: Replace with actual resale contract address
        ticketResaleABI,
        signer
      );

      // For demo purposes, create mock listings
      const mockListings: ResaleListing[] = [
        {
          listingId: 1,
          eventContract: eventContractAddress,
          tokenId: 1,
          seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          price: '0.015',
          isActive: true,
          ticketTier: 'General',
          sellerName: 'Alice'
        },
        {
          listingId: 2,
          eventContract: eventContractAddress,
          tokenId: 2,
          seller: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          price: '0.025',
          isActive: true,
          ticketTier: 'VIP',
          sellerName: 'Bob'
        }
      ];

      setListings(mockListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast({
        title: "Failed to Load Listings",
        description: "Could not load resale listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingListings(false);
    }
  };

  const fetchUserTickets = async () => {
    if (!provider || !account) return;
    
    try {
      const signer = await provider.getSigner();
      const eventContract = new ethers.Contract(eventContractAddress, eventTicketABI, signer);
      
      const ticketIds = await eventContract.getUserTickets(account);
      const userTicketsData = [];

      for (const ticketId of ticketIds) {
        try {
          const ticketData = await eventContract.getTicket(ticketId);
          userTicketsData.push({
            tokenId: ticketId,
            tier: ticketData.tier,
            seatNumber: ticketData.seatNumber,
            metadataURI: ticketData.metadataURI
          });
        } catch (error) {
          console.warn(`Failed to fetch ticket ${ticketId}:`, error);
        }
      }

      setUserTickets(userTicketsData);
    } catch (error) {
      console.error('Failed to fetch user tickets:', error);
    }
  };

  const handleListTicket = async () => {
    if (!selectedTicket || !resalePrice || !isConnected || !provider) {
      toast({
        title: "Missing Information",
        description: "Please select a ticket and enter a resale price",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signer = await provider.getSigner();
      const eventContract = new ethers.Contract(eventContractAddress, eventTicketABI, signer);
      const resaleContract = new ethers.Contract(
        '0x0000000000000000000000000000000000000000', // TODO: Replace with actual resale contract address
        ticketResaleABI,
        signer
      );

      // First approve the resale contract
      const approveTx = await eventContract.approve(
        '0x0000000000000000000000000000000000000000', // TODO: Replace with actual resale contract address
        selectedTicket.tokenId
      );
      
      toast({
        title: "Approving Ticket",
        description: "Please confirm the approval transaction in your wallet",
      });

      await approveTx.wait();

      // List ticket for resale
      const priceInWei = ethers.parseEther(resalePrice);
      const listTx = await resaleContract.listTicketForResale(
        eventContractAddress,
        selectedTicket.tokenId,
        priceInWei
      );

      toast({
        title: "Listing Ticket",
        description: "Please confirm the listing transaction in your wallet",
      });

      const receipt = await listTx.wait();
      
      toast({
        title: "Ticket Listed Successfully! 🎉",
        description: `Your ${selectedTicket.tier} ticket is now listed for ${resalePrice} ETH`,
      });

      // Reset form and refresh data
      setSelectedTicket(null);
      setResalePrice('');
      await fetchListings();
      await fetchUserTickets();

    } catch (error: any) {
      console.error('Failed to list ticket:', error);
      
      let errorMessage = 'Failed to list ticket for resale';
      if (error.code === 'USER_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient allowance')) {
        errorMessage = 'Please approve the resale contract first';
      }

      toast({
        title: "Listing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyResaleTicket = async (listing: ResaleListing) => {
    if (!isConnected || !provider) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase resale tickets",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signer = await provider.getSigner();
      const resaleContract = new ethers.Contract(
        '0x0000000000000000000000000000000000000000', // TODO: Replace with actual resale contract address
        ticketResaleABI,
        signer
      );

      const priceInWei = ethers.parseEther(listing.price);
      
      const buyTx = await resaleContract.buyResaleTicket(listing.listingId, {
        value: priceInWei
      });

      toast({
        title: "Purchasing Ticket",
        description: "Please confirm the purchase transaction in your wallet",
      });

      const receipt = await buyTx.wait();
      
      toast({
        title: "Purchase Successful! 🎉",
        description: `You've successfully purchased the ${listing.ticketTier} ticket for ${listing.price} ETH!`,
      });

      // Refresh listings
      await fetchListings();

    } catch (error: any) {
      console.error('Failed to buy resale ticket:', error);
      
      let errorMessage = 'Failed to purchase resale ticket';
      if (error.code === 'USER_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds in your wallet';
      }

      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isWeb3Event) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">🔄 Resale Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 text-sm">
            Resale marketplace is only available for Web3 NFT events.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🔄 NFT Ticket Resale Marketplace
        </h2>
        <p className="text-muted-foreground">
          Buy and sell NFT tickets on the secondary market
        </p>
      </div>

      {/* Wallet Status */}
      {!isConnected ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🔗</span>
              <p className="text-yellow-800">
                Connect your wallet to access the resale marketplace
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <p className="text-green-800">
                  Wallet Connected: {account?.substring(0, 10)}...
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {currentNetwork}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'list')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">🛒 Browse Listings</TabsTrigger>
          <TabsTrigger value="list">📝 List My Tickets</TabsTrigger>
        </TabsList>

        {/* Browse Listings Tab */}
        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Resale Tickets</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchListings}
              disabled={isLoadingListings}
            >
              {isLoadingListings ? '⏳' : '🔄'} Refresh
            </Button>
          </div>

          {isLoadingListings ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-muted-foreground">Loading resale listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏪</div>
                <h4 className="text-lg font-semibold mb-2">No Resale Listings</h4>
                <p className="text-muted-foreground">
                  No tickets are currently listed for resale. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => (
                <Card key={listing.listingId} className="border-green-200 hover:border-green-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {listing.ticketTier}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Token #{listing.tokenId}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Seller: {listing.sellerName || listing.seller.substring(0, 10)}...
                        </p>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-xl font-bold text-green-600">
                          {listing.price} ETH
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ~${(parseFloat(listing.price) * 2000).toFixed(2)} USD
                        </div>
                        <Button
                          onClick={() => handleBuyResaleTicket(listing)}
                          disabled={isLoading || !isConnected}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? '⏳' : '💰'} Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* List Tickets Tab */}
        <TabsContent value="list" className="space-y-4">
          <h3 className="text-lg font-semibold">List Your Tickets for Resale</h3>
          
          {userTickets.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎫</div>
                <h4 className="text-lg font-semibold mb-2">No Tickets to List</h4>
                <p className="text-muted-foreground">
                  You don't own any tickets for this event yet. Purchase tickets first to list them for resale.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Ticket Selection */}
              <div className="space-y-3">
                <Label>Select Ticket to List</Label>
                <div className="grid gap-2">
                  {userTickets.map((ticket) => (
                    <Card 
                      key={ticket.tokenId}
                      className={`cursor-pointer transition-all ${
                        selectedTicket?.tokenId === ticket.tokenId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{ticket.tier} Ticket</div>
                            <div className="text-sm text-muted-foreground">
                              Seat #{ticket.seatNumber} • Token #{ticket.tokenId}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {selectedTicket?.tokenId === ticket.tokenId ? 'Selected' : 'Click to Select'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resale Price Input */}
              {selectedTicket && (
                <div className="space-y-3">
                  <Label htmlFor="resalePrice">Resale Price (ETH)</Label>
                  <Input
                    id="resalePrice"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.015"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the price you want to sell your ticket for
                  </p>
                </div>
              )}

              {/* List Button */}
              {selectedTicket && resalePrice && (
                <Button
                  onClick={handleListTicket}
                  disabled={isLoading || !isConnected}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Listing Ticket...
                    </>
                  ) : (
                    <>
                      📝 List {selectedTicket.tier} Ticket for {resalePrice} ETH
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">💡 How Resale Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-700 text-sm">
            <p>• List your tickets at any price you choose</p>
            <p>• Buy tickets from other users instantly</p>
            <p>• All transactions are secured by smart contracts</p>
            <p>• No platform fees or hidden charges</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800 text-lg">⚡ Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-purple-700 text-sm">
            <p>• Instant liquidity for your tickets</p>
            <p>• Access to sold-out events</p>
            <p>• Transparent pricing and history</p>
            <p>• Secure peer-to-peer trading</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
