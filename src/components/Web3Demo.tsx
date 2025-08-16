import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, Plus, Ticket, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Web3Wallet } from './Web3Wallet';

export function Web3Demo() {
  const { 
    isConnected, 
    currentNetwork, 
    createEvent, 
    purchaseTicket, 
    listTicketForResale,
    isCreatingEvent,
    isPurchasing,
    isListing
  } = useWallet();
  
  const { toast } = useToast();
  const [eventForm, setEventForm] = useState({
    name: 'Web3 Hackathon Concert',
    description: 'A revolutionary Web3 ticketing event',
    maxOccupancy: '100',
    tierPrices: ['0.01', '0.02', '0.05'],
    tierNames: ['Bronze', 'Silver', 'Gold'],
    tierQuantities: ['40', '35', '25']
  });

  const [ticketForm, setTicketForm] = useState({
    eventContract: '',
    tier: 'Gold',
    seatNumber: '1',
    price: '0.05'
  });

  const [resaleForm, setResaleForm] = useState({
    eventContract: '',
    tokenId: '1',
    price: '0.08'
  });

  const handleCreateEvent = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventConfig = {
        eventName: eventForm.name,
        eventDescription: eventForm.description,
        maxOccupancy: parseInt(eventForm.maxOccupancy),
        tierPrices: eventForm.tierPrices.map(price => parseFloat(price)),
        tierNames: eventForm.tierNames,
        eventDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
        tierQuantities: eventForm.tierQuantities.map(qty => parseInt(qty))
      };

      const result = await createEvent(eventConfig);
      
      if (result.success) {
        toast({
          title: "Event Created Successfully!",
          description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
          variant: "default",
        });
      } else {
        toast({
          title: "Event Creation Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseTicket = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await purchaseTicket(
        ticketForm.eventContract,
        ticketForm.tier,
        parseInt(ticketForm.seatNumber),
        ticketForm.price
      );
      
      if (result.success) {
        toast({
          title: "Ticket Purchased Successfully!",
          description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
          variant: "default",
        });
      } else {
        toast({
          title: "Ticket Purchase Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleListForResale = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await listTicketForResale(
        resaleForm.eventContract,
        parseInt(resaleForm.tokenId),
        resaleForm.price
      );
      
      if (result.success) {
        toast({
          title: "Ticket Listed for Resale!",
          description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
          variant: "default",
        });
      } else {
        toast({
          title: "Listing Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🚀 Web3 Ticketing Demo
        </h1>
        <p className="text-xl text-gray-600">
          Experience the future of event ticketing with blockchain technology
        </p>
        <Badge className="text-lg px-4 py-2">
          Network: {currentNetwork}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Connection */}
        <div>
          <Web3Wallet />
        </div>

        {/* Demo Actions */}
        <div className="space-y-6">
          {/* Event Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Event (Web3)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    value={eventForm.maxOccupancy}
                    onChange={(e) => setEventForm({...eventForm, maxOccupancy: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleCreateEvent} 
                disabled={!isConnected || isCreatingEvent}
                className="w-full"
              >
                {isCreatingEvent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event on Blockchain
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Ticket Purchase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Purchase NFT Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventContract">Event Contract</Label>
                  <Input
                    id="eventContract"
                    placeholder="0x..."
                    value={ticketForm.eventContract}
                    onChange={(e) => setTicketForm({...ticketForm, eventContract: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="seatNumber">Seat Number</Label>
                  <Input
                    id="seatNumber"
                    type="number"
                    value={ticketForm.seatNumber}
                    onChange={(e) => setTicketForm({...ticketForm, seatNumber: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <select
                    id="tier"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={ticketForm.tier}
                    onChange={(e) => setTicketForm({...ticketForm, tier: e.target.value})}
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ticketPrice">Price</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm({...ticketForm, price: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handlePurchaseTicket} 
                disabled={!isConnected || isPurchasing}
                className="w-full"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing Ticket...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Mint NFT Ticket
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Resale Listing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                List Ticket for Resale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resaleEventContract">Event Contract</Label>
                  <Input
                    id="resaleEventContract"
                    placeholder="0x..."
                    value={resaleForm.eventContract}
                    onChange={(e) => setResaleForm({...resaleForm, eventContract: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="tokenId">Token ID</Label>
                  <Input
                    id="tokenId"
                    type="number"
                    value={resaleForm.tokenId}
                    onChange={(e) => setResaleForm({...resaleForm, tokenId: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="resalePrice">Resale Price</Label>
                <Input
                  id="resalePrice"
                  type="number"
                  step="0.01"
                  value={resaleForm.price}
                  onChange={(e) => setResaleForm({...resaleForm, price: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleListForResale} 
                disabled={!isConnected || isListing}
                className="w-full"
              >
                {isListing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listing Ticket...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    List for Resale
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Demo Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Smart Contracts: Deployed & Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Web3 Service: Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>MetaMask Integration: Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
