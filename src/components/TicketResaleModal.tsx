import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowUpRight, 
  Wallet, 
  Hash, 
  Network, 
  Clock,
  User,
  Building,
  Ticket,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  DollarSign,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";

interface TicketResaleModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
  children?: React.ReactNode;
}

export function TicketResaleModal({ ticket, isOpen, onClose, onSuccess, children }: TicketResaleModalProps) {
  const [resalePrice, setResalePrice] = useState<string>('');
  const [isListing, setIsListing] = useState(false);
  const [listingStatus, setListingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [estimatedFees, setEstimatedFees] = useState<{
    gas: string;
    platform: string;
    total: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { isConnected, account, currentNetwork } = useWallet();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setResalePrice('');
      setListingStatus('idle');
      setTxHash(null);
      setEstimatedFees(null);
    }
  }, [isOpen]);

  // Calculate estimated fees when price changes
  useEffect(() => {
    if (resalePrice && parseFloat(resalePrice) > 0) {
      calculateEstimatedFees();
    }
  }, [resalePrice]);

  const calculateEstimatedFees = () => {
    const price = parseFloat(resalePrice);
    if (price <= 0) return;

    // Estimate gas fees (this would be more accurate with actual gas estimation)
    const estimatedGas = 0.001; // 0.001 ETH/AVAX
    const platformFee = price * 0.025; // 2.5% platform fee
    const total = estimatedGas + platformFee;

    setEstimatedFees({
      gas: estimatedGas.toFixed(4),
      platform: platformFee.toFixed(4),
      total: total.toFixed(4)
    });
  };

  const validatePrice = (price: string): boolean => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleListForResale = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to list tickets for resale",
        variant: "destructive",
      });
      return;
    }

    if (!validatePrice(resalePrice)) return;

    setIsListing(true);
    setListingStatus('idle');

    try {
      console.log('🚀 Listing ticket for resale:', {
        eventContract: ticket.eventContract,
        tokenId: ticket.tokenId,
        price: resalePrice,
        network: currentNetwork
      });

      // List ticket for resale through smart contract
      const result = await web3Service.listTicketForResale(
        ticket.eventContract,
        parseInt(ticket.tokenId),
        resalePrice
      );

      console.log('✅ Ticket listed successfully:', result);
      
      setListingStatus('success');
      setTxHash(result);
      
      toast({
        title: "Ticket Listed Successfully!",
        description: `Your ${ticket.tier} ticket is now available for resale at ${resalePrice} ${getNetworkCurrency()}`,
        variant: "default",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('❌ Error listing ticket for resale:', error);
      setListingStatus('error');
      
      toast({
        title: "Listing Failed",
        description: error.message || "Failed to list ticket for resale",
        variant: "destructive",
      });
    } finally {
      setIsListing(false);
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

  const getNetworkDisplayName = (network: string): string => {
    switch (network) {
      case 'LOCALHOST':
        return 'Hardhat Local';
      case 'AVALANCHE_FUJI':
        return 'Avalanche Fuji';
      case 'SEPOLIA':
        return 'Sepolia Testnet';
      default:
        return network;
    }
  };

  const getNetworkExplorerUrl = (network: string, contractAddress: string): string => {
    switch (network) {
      case 'LOCALHOST':
        return `http://localhost:8545/address/${contractAddress}`;
      case 'AVALANCHE_FUJI':
        return `https://testnet.snowtrace.io/address/${contractAddress}`;
      case 'SEPOLIA':
        return `https://sepolia.etherscan.io/address/${contractAddress}`;
      default:
        return `https://etherscan.io/address/${contractAddress}`;
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">List for Resale</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            List {ticket.tier} Ticket for Resale
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Information Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Event</span>
                  </div>
                  <p className="font-medium text-sm">
                    {ticket.eventTitle || ticket.eventName}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                      ticket.tier === 'Platinum' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      ticket.tier === 'Gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      ticket.tier === 'Silver' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      ticket.tier === 'Bronze' ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
                      'bg-blue-500'
                    }`}>
                      {ticket.tier}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ⛓️ NFT
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Token ID</span>
                  </div>
                  <p className="font-mono text-sm">{ticket.tokenId}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Owner</span>
                  </div>
                  <p className="font-mono text-xs break-all">
                    {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Network className="h-4 w-4" />
                    <span>Network</span>
                  </div>
                  <Badge variant="outline">
                    {getNetworkDisplayName(ticket.network)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <span>Contract</span>
                  </div>
                  <p className="font-mono text-xs break-all">
                    {ticket.eventContract?.substring(0, 8)}...{ticket.eventContract?.substring(ticket.eventContract.length - 6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resale Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resale Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resale-price">Resale Price ({getNetworkCurrency()})</Label>
                <div className="relative">
                  <Input
                    id="resale-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    className="pr-12"
                    disabled={isListing}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-muted-foreground">
                      {getNetworkCurrency()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set the price at which you want to sell your ticket
                </p>
              </div>

              {/* Estimated Fees */}
              {estimatedFees && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estimated Fees</Label>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gas Fee:</span>
                      <span>{estimatedFees.gas} {getNetworkCurrency()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Fee (2.5%):</span>
                      <span>{estimatedFees.platform} {getNetworkCurrency()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Fees:</span>
                      <span>{estimatedFees.total} {getNetworkCurrency()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-medium">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Your ticket will be transferred to the resale contract</li>
                      <li>You can cancel the listing at any time before it's sold</li>
                      <li>Platform fee of 2.5% applies to successful sales</li>
                      <li>Gas fees are required for blockchain transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isListing}>
              Cancel
            </Button>
            
            {!isConnected ? (
              <Button disabled className="opacity-50">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : listingStatus === 'success' ? (
              <Button variant="default" disabled>
                <CheckCircle className="h-4 w-4 mr-2" />
                Listed Successfully!
              </Button>
            ) : listingStatus === 'error' ? (
              <Button variant="destructive" onClick={handleListForResale} disabled={isListing}>
                {isListing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            ) : (
              <Button 
                onClick={handleListForResale} 
                disabled={isListing || !resalePrice || parseFloat(resalePrice) <= 0}
                className="btn-hero"
              >
                {isListing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    List for Resale
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success/Error Messages */}
          {listingStatus === 'success' && txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Ticket Listed Successfully!</span>
              </div>
              <div className="mt-2 space-y-2 text-sm text-green-700">
                <p>Your ticket is now available for resale on the marketplace.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    TX: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getNetworkExplorerUrl(ticket.network, txHash), '_blank')}
                    className="h-6 px-2 text-xs"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          )}

          {listingStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Listing Failed</span>
              </div>
              <p className="mt-1 text-sm text-red-700">
                There was an error listing your ticket. Please try again or check your wallet connection.
              </p>
            </div>
          )}

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Wallet Not Connected</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Please connect your wallet to list tickets for resale.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
