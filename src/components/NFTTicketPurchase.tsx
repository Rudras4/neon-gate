import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { EVENT_TICKET_ABI } from '@/lib/web3';

interface NFTTicketPurchaseProps {
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

export const NFTTicketPurchase: React.FC<NFTTicketPurchaseProps> = ({
  eventContractAddress,
  tickets,
  eventId,
  isWeb3Event
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tierPrices, setTierPrices] = useState<{[key: string]: string}>({});
  const [tierQuantities, setTierQuantities] = useState<{[key: string]: number}>({});
  
  const { toast } = useToast();
  const { isConnected, currentNetwork, account } = useWallet();

  // Debug logging for wallet state
  console.log('🔍 NFTTicketPurchase render state:', {
    isConnected,
    currentNetwork,
    account: account?.substring(0, 10) + '...',
    selectedTier,
    quantity,
    eventContractAddress: eventContractAddress?.substring(0, 10) + '...'
  });

  // Validate contract address
  if (!eventContractAddress || eventContractAddress === '') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">❌ Contract Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">
            This Web3 event does not have a contract address yet. Please contact the event organizer.
          </p>
          <div className="mt-2 text-xs text-red-600">
            Contract Address: {eventContractAddress || 'Not set'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validate contract address format
  if (!eventContractAddress.startsWith('0x') || eventContractAddress.length !== 42) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">❌ Invalid Contract Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">
            The contract address for this event is not in the correct format.
          </p>
          <div className="mt-2 text-xs text-red-600">
            Contract Address: {eventContractAddress}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isWeb3Event) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">🎫 Traditional Event</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 text-sm">
            This is a traditional event. Web3 NFT tickets are not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use centralized ABI from web3.ts
  const eventTicketABI = EVENT_TICKET_ABI;

  useEffect(() => {
    if (isWeb3Event && eventContractAddress && isConnected) {
      fetchTierData();
    }
  }, [isWeb3Event, eventContractAddress, isConnected]);

  const fetchTierData = async () => {
    // Validate contract address before fetching
    if (!eventContractAddress || !eventContractAddress.startsWith('0x')) {
      console.log('⚠️ Skipping tier data fetch for invalid contract address');
      return;
    }

    try {
      // Create provider directly from window.ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer) return;

      const contract = new ethers.Contract(eventContractAddress, eventTicketABI, signer);
      
      const prices: {[key: string]: string} = {};
      const quantities: {[key: string]: number} = {};

      for (const ticket of tickets) {
        try {
          const tierData = await contract.getTier(ticket.tier);
          prices[ticket.tier] = ethers.formatEther(tierData.price);
          quantities[ticket.tier] = Number(tierData.quantity);
        } catch (error) {
          console.warn(`Failed to fetch tier data for ${ticket.tier}:`, error);
          // Fallback to frontend data
          prices[ticket.tier] = ticket.price;
          quantities[ticket.tier] = ticket.available;
        }
      }

      setTierPrices(prices);
      setTierQuantities(quantities);
    } catch (error) {
      console.error('Failed to fetch tier data:', error);
    }
  };

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
    setQuantity(1); // Reset quantity when tier changes
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    const maxAvailable = tierQuantities[selectedTier] || 0;
    if (newQuantity > maxAvailable) return;
    setQuantity(newQuantity);
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTier) {
      toast({
        title: "No Tier Selected",
        description: "Please select a ticket tier",
        variant: "destructive",
      });
      return;
    }

    // Validate contract address before proceeding
    if (!eventContractAddress || !eventContractAddress.startsWith('0x')) {
      toast({
        title: "Invalid Contract Address",
        description: "This event does not have a valid contract address. Please contact the event organizer.",
        variant: "destructive",
      });
      return;
    }

    if (!eventContractAddress || eventContractAddress === '') {
      console.log('❌ No contract address');
      toast({
        title: "Contract Not Available",
        description: "This event does not have a contract address yet",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Proceeding with purchase...');
    setIsLoading(true);

    try {
      // Create provider directly from window.ethereum
      console.log('🔧 Creating provider from window.ethereum...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('🔧 Signer obtained:', !!signer);
      
      const contract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, signer);
      console.log('🔧 Contract instance created');

      // Get tier price from contract
      console.log('💰 Fetching tier price for:', selectedTier);
      const tierData = await contract.getTier(selectedTier);
      const tierPrice = tierData.price;
      const totalCost = tierPrice * BigInt(quantity);
      console.log('💰 Price details:', {
        tierPrice: tierPrice.toString(),
        quantity,
        totalCost: totalCost.toString()
      });

      // Create metadata URI for the ticket
      const metadataURI = `ipfs://Qm${selectedTier.toLowerCase()}Ticket_${Date.now()}`;
      console.log('🔗 Metadata URI:', metadataURI);

      // Purchase ticket(s)
      console.log('🎫 Initiating ticket purchase...');
      const tx = await contract.buyTicket(selectedTier, metadataURI, {
        value: totalCost
      });
      console.log('🎫 Transaction submitted:', tx.hash);

      toast({
        title: "Transaction Submitted",
        description: "Your ticket purchase is being processed on the blockchain",
      });

      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);
      
      toast({
        title: "Purchase Successful! 🎉",
        description: `You've successfully purchased ${quantity} ${selectedTier} ticket(s)! Transaction: ${receipt.hash.substring(0, 10)}...`,
      });

      // Refresh tier data
      await fetchTierData();
      
      // Reset form
      setSelectedTier('');
      setQuantity(1);

    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      let errorMessage = 'Failed to purchase ticket';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds in your wallet';
      } else if (error.message?.includes('Tier sold out')) {
        errorMessage = 'This tier is sold out';
      } else if (error.message?.includes('Insufficient payment')) {
        errorMessage = 'Insufficient payment amount';
      } else if (error.message?.includes('UNCONFIGURED_NAME')) {
        errorMessage = 'Invalid contract address. Please contact the event organizer.';
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

  const getTierPrice = (tier: string) => {
    return tierPrices[tier] || tickets.find(t => t.tier === tier)?.price || '0';
  };

  const getTierAvailability = (tier: string) => {
    return tierQuantities[tier] || tickets.find(t => t.tier === tier)?.available || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🎫 Purchase NFT Tickets
        </h2>
        <p className="text-muted-foreground">
          Buy tickets directly from the blockchain and receive unique NFT tokens
        </p>
      </div>

      {/* Wallet Status */}
      {!isConnected ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🔗</span>
              <p className="text-yellow-800">
                Connect your wallet to purchase NFT tickets
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

      {/* Ticket Tiers */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Select Ticket Tier</h3>
        <div className="grid gap-3">
          {tickets.map((ticket) => {
            const price = getTierPrice(ticket.tier);
            const available = getTierAvailability(ticket.tier);
            const isSelected = selectedTier === ticket.tier;
            const isSoldOut = available === 0;

            return (
              <Card 
                key={ticket.tier}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : isSoldOut
                    ? 'border-gray-300 bg-gray-50 opacity-60'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
                onClick={() => !isSoldOut && handleTierSelect(ticket.tier)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{ticket.tier}</h4>
                        {isSoldOut && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {available} of {ticket.total} available
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {parseFloat(price).toFixed(4)} ETH
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ~${(parseFloat(price) * 2000).toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quantity Selection */}
      {selectedTier && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="text-sm text-muted-foreground">
              Max: {getTierAvailability(selectedTier)}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            
            <Input
              id="quantity"
              type="number"
              min="1"
              max={getTierAvailability(selectedTier)}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-20 text-center"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= getTierAvailability(selectedTier)}
            >
              +
            </Button>
          </div>

          {/* Total Cost */}
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Cost</div>
            <div className="text-2xl font-bold text-purple-600">
              {(parseFloat(getTierPrice(selectedTier)) * quantity).toFixed(4)} ETH
            </div>
            <div className="text-sm text-muted-foreground">
              ~${(parseFloat(getTierPrice(selectedTier)) * quantity * 2000).toFixed(2)} USD
            </div>
          </div>
        </div>
      )}

      {/* Purchase Button */}
      {selectedTier && (
        <Button
          onClick={handlePurchase}
          disabled={!isConnected || isLoading || getTierAvailability(selectedTier) === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing Purchase...
            </>
          ) : (
            <>
              🎫 Purchase {quantity} {selectedTier} Ticket{quantity > 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}

      {/* Info Cards */}
      <div className="grid gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">💡 How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-700 text-sm">
            <p>• Connect your wallet to purchase tickets</p>
            <p>• Each ticket is a unique NFT on the blockchain</p>
            <p>• Tickets can be resold on the secondary market</p>
            <p>• All transactions are secure and transparent</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 text-lg">🔒 Security Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-green-700 text-sm">
            <p>• Smart contract verified and audited</p>
            <p>• No middleman fees or delays</p>
            <p>• Immutable ownership records</p>
            <p>• Instant delivery to your wallet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
