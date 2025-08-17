import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  ExternalLink, 
  Wallet, 
  Hash, 
  Network, 
  Clock,
  User,
  Building,
  Ticket,
  Copy,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';
import { TicketResaleModal } from "./TicketResaleModal";

interface TicketDisplayProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function TicketDisplay({ ticket, isOpen, onClose, children }: TicketDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const { toast } = useToast();

  // Generate QR code for the ticket
  useEffect(() => {
    if (ticket && isOpen) {
      generateQRCode();
    }
  }, [ticket, isOpen]);

  const generateQRCode = async () => {
    if (!ticket) return;
    
    setIsGeneratingQR(true);
    try {
      // Create comprehensive ticket data for QR code
      const qrData = {
        ticketId: ticket.isNFT ? ticket.tokenId : ticket.id,
        eventName: ticket.eventTitle || ticket.eventName,
        tier: ticket.tier,
        seatNumber: ticket.seatNumber,
        type: ticket.isNFT ? 'NFT' : 'Traditional',
        network: ticket.network,
        contractAddress: ticket.eventContract,
        timestamp: new Date().toISOString()
      };

      const qrString = JSON.stringify(qrData);
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
        variant: "default",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getNetworkExplorerUrl = (network: string, contractAddress: string) => {
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

  const getNetworkDisplayName = (network: string) => {
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

  const handleResaleSuccess = (listingId: string) => {
    toast({
      title: "Resale Listing Created!",
      description: `Your ticket is now available for resale. Listing ID: ${listingId}`,
      variant: "default",
    });
    // Close the ticket display modal after successful listing
    setTimeout(() => onClose(), 2000);
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">View Ticket</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {ticket.eventTitle || ticket.eventName} - {ticket.tier} Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                    ticket.tier === 'Platinum' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    ticket.tier === 'Gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    ticket.tier === 'Silver' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    ticket.tier === 'Bronze' ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
                    'bg-blue-500'
                  }`}>
                    {ticket.tier}
                  </div>
                  {ticket.isNFT && (
                    <Badge variant="outline" className="text-xs">
                      ⛓️ NFT
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Ticket ID</p>
                  <p className="font-mono text-sm">
                    {ticket.isNFT ? `NFT #${ticket.tokenId}` : ticket.id}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Event & Ticket Details */}
            <div className="space-y-6">
              {/* Event Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                      </div>
                      <p className="font-medium">{ticket.eventDate}</p>
                    </div>
                    
                    {ticket.eventLocation && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Location</span>
                        </div>
                        <p className="font-medium">{ticket.eventLocation}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                      <span>Seat Number</span>
                    </div>
                    <p className="font-medium text-lg">{ticket.seatNumber || 'TBD'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Ticket Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Owner</span>
                      </div>
                      <p className="font-mono text-sm break-all">
                        {ticket.owner || ticket.buyerAddress || 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Purchase Date</span>
                      </div>
                      <p className="font-medium">{ticket.purchaseDate || 'Unknown'}</p>
                    </div>
                  </div>

                  {ticket.isNFT && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>Metadata URI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs break-all flex-1">
                          {ticket.metadataURI || 'No metadata available'}
                        </p>
                        {ticket.metadataURI && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticket.metadataURI, 'Metadata URI')}
                          >
                            {copiedField === 'Metadata URI' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - QR Code & Blockchain Info */}
            <div className="space-y-6">
              {/* QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {isGeneratingQR ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Ticket QR Code" 
                        className="mx-auto border rounded-lg shadow-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Scan this QR code to verify ticket authenticity
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <span className="ml-2">Failed to generate QR code</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blockchain Information (NFT tickets only) */}
              {ticket.isNFT && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Blockchain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Network className="h-4 w-4" />
                          <span>Network</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getNetworkDisplayName(ticket.network)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticket.network, 'Network')}
                          >
                            {copiedField === 'Network' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span>Contract Address</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs break-all flex-1">
                            {ticket.eventContract}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticket.eventContract, 'Contract Address')}
                          >
                            {copiedField === 'Contract Address' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          <span>Token ID</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">{ticket.tokenId}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticket.tokenId, 'Token ID')}
                          >
                            {copiedField === 'Token ID' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Explorer Link */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(getNetworkExplorerUrl(ticket.network, ticket.eventContract), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on {getNetworkDisplayName(ticket.network)} Explorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {ticket.isNFT && (
              <TicketResaleModal
                ticket={ticket}
                isOpen={isResaleModalOpen}
                onClose={() => setIsResaleModalOpen(false)}
                onSuccess={handleResaleSuccess}
              >
                <Button variant="default">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  List for Resale
                </Button>
              </TicketResaleModal>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
