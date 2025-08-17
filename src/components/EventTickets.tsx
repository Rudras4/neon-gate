import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { ticketsAPI } from '@/lib/api';
import { ethers } from 'ethers';
import { NFTTicketPurchase } from './NFTTicketPurchase';
import { NFTTicketResale } from './NFTTicketResale';
import { NFTTicketDashboard } from './NFTTicketDashboard';

interface Ticket {
  tier: string;
  price: string;
  available: number;
  total: number;
  originalIndex?: number;
}

interface EventTicketsProps {
  tickets: Ticket[];
  eventId: string;
  isWeb3Event: boolean;
  blockchainTxHash?: string;
  eventContractAddress?: string;
}

export const EventTickets: React.FC<EventTicketsProps> = ({
  tickets,
  eventId,
  isWeb3Event,
  blockchainTxHash,
  eventContractAddress
}) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'resale' | 'dashboard'>('purchase');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isConnected, currentNetwork, account } = useWallet();

  const handlePurchase = async (ticket: Ticket) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets",
        variant: "destructive",
      });
      return;
    }

    // For Web3 events, use smart contract
    if (isWeb3Event && eventContractAddress) {
      await handleWeb3Purchase(ticket);
    } else {
      // For traditional events, use backend API
      await handleTraditionalPurchase(ticket);
    }
  };

  const handleWeb3Purchase = async (ticket: Ticket) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase Web3 tickets",
        variant: "destructive",
      });
      return;
    }

    if (!eventContractAddress) {
      toast({
        title: "Contract Not Found",
        description: "Event contract address not available",
        variant: "destructive",
      });
      return;
    }

    setSelectedTicket(ticket);
    setIsPurchasing(true);

    try {
      // Get wallet provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        eventContractAddress,
        [
          "function buyTicket(string tierName, string metadataURI) external payable returns (uint256)",
          "function getTier(string tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))"
        ],
        signer
      );

      // Get tier price from contract
      const tierInfo = await contract.getTier(ticket.tier);
      const tierPrice = tierInfo.price;
      
      // Create metadata URI for the ticket
      const metadataURI = `ipfs://Qm${ticket.tier.toLowerCase()}Ticket_${Date.now()}`;
      
      // Purchase ticket
      const tx = await contract.buyTicket(ticket.tier, metadataURI, {
        value: tierPrice
      });

      toast({
        title: "Transaction Submitted",
        description: "Your ticket purchase is being processed on the blockchain",
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "Purchase Successful! 🎉",
        description: `You've successfully purchased a ${ticket.tier} ticket! Transaction: ${receipt.hash.substring(0, 10)}...`,
      });

      // Reset form
      setSelectedTicket(null);
      setIsPurchasing(false);

    } catch (error: any) {
      console.error('Web3 purchase failed:', error);
      
      let errorMessage = 'Failed to purchase ticket';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds in your wallet';
      } else if (error.message?.includes('Tier sold out')) {
        errorMessage = 'This tier is sold out';
      } else if (error.message?.includes('Insufficient payment')) {
        errorMessage = 'Insufficient payment amount';
      }

      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsPurchasing(false);
    }
  };

  const handleTraditionalPurchase = async (ticket: Ticket) => {
    try {
      setIsPurchasing(true);
      
      const response = await ticketsAPI.purchaseTicket(eventId, {
        eventId,
        ticketType: ticket.tier,
        price: parseFloat(ticket.price),
        quantity: 1,
        tierIndex: ticket.originalIndex || 0
      });

      toast({
        title: "Ticket Purchased! 🎉",
        description: `Successfully purchased ${ticket.tier} ticket for ₹${ticket.price}`,
      });

    } catch (error) {
      console.error('Traditional purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleResale = () => {
    setActiveTab('resale');
  };

  // For traditional events, show simple ticket purchase interface
  if (!isWeb3Event) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">🎫 Purchase Tickets</h2>
          <p className="text-muted-foreground">
            Buy tickets for this traditional event
          </p>
        </div>

        {/* Traditional Event Information */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                🎭 Traditional Event
              </Badge>
            </div>
            <p className="text-sm text-orange-700">
              This is a traditional event with standard ticket purchasing.
              {!isAuthenticated && " Please log in to purchase tickets."}
            </p>
          </CardContent>
        </Card>

        {/* Ticket Selection */}
        <div className="grid gap-4">
          {tickets.map((ticket, index) => (
            <Card key={index} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{ticket.tier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {ticket.available} of {ticket.total} available
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{ticket.price}
                    </div>
                  </div>
                  
                  <div className="space-x-2">
                    {ticket.available > 0 ? (
                      <Button
                        onClick={() => handlePurchase(ticket)}
                        disabled={isPurchasing}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isPurchasing && selectedTicket === ticket ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Purchasing...
                          </>
                        ) : (
                          `Buy ${ticket.tier} Ticket`
                        )}
                      </Button>
                    ) : (
                      <Button disabled variant="outline">
                        Sold Out
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // For Web3 events, show comprehensive NFT interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🎫 NFT Ticket System
        </h2>
        <p className="text-muted-foreground">
          Experience the future of ticketing with blockchain-powered NFTs
        </p>
      </div>

      {/* Web3 Event Information */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⛓️ Web3 Event
            </Badge>
            {blockchainTxHash && (
              <Badge variant="outline" className="text-xs">
                TX: {blockchainTxHash.substring(0, 10)}...
              </Badge>
            )}
          </div>
          <p className="text-sm text-purple-700">
            This is a Web3 event! Tickets are NFTs on the blockchain. 
            {!isConnected && " Connect your wallet to access all features."}
          </p>
          {isConnected && (
            <p className="text-xs text-purple-600 mt-1">
              Connected: {account?.substring(0, 10)}... | Network: {currentNetwork}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main NFT Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'purchase' | 'resale' | 'dashboard')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">💰 Purchase</TabsTrigger>
          <TabsTrigger value="resale">🔄 Resale</TabsTrigger>
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
        </TabsList>

        {/* Purchase Tab */}
        <TabsContent value="purchase" className="space-y-4">
          <NFTTicketPurchase
            eventContractAddress={eventContractAddress || ''}
            tickets={tickets}
            eventId={eventId}
            isWeb3Event={isWeb3Event}
          />
        </TabsContent>

        {/* Resale Tab */}
        <TabsContent value="resale" className="space-y-4">
          <NFTTicketResale
            eventContractAddress={eventContractAddress || ''}
            tickets={tickets}
            eventId={eventId}
            isWeb3Event={isWeb3Event}
          />
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <NFTTicketDashboard
            eventContractAddress={eventContractAddress || ''}
            isWeb3Event={isWeb3Event}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => setActiveTab('purchase')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🎫 Buy Tickets
              </Button>
              <Button 
                onClick={() => setActiveTab('resale')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                🔄 Browse Resale
              </Button>
              <Button 
                onClick={() => setActiveTab('dashboard')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                📊 My Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 text-lg">💡 Web3 Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-green-700 text-sm">
            <p>• True ownership of your tickets as NFTs</p>
            <p>• Trade tickets on the secondary market</p>
            <p>• No scalping or fake tickets</p>
            <p>• Transparent pricing and history</p>
            <p>• Instant delivery and verification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};