import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ExternalLink, Zap } from "lucide-react";
import { useState } from "react";

export function WalletSection() {
  const [isConnected, setIsConnected] = useState(false);
  
  // Mock wallet data
  const wallet = {
    address: "0x1234567890123456789012345678901234567890",
    balance: "12.5",
    network: "Avalanche Fuji Testnet"
  };

  const handleConnect = () => {
    // Mock wallet connection
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    // You could add a toast notification here
  };

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Wallet</h2>
        {isConnected && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your MetaMask wallet to buy tickets and manage your NFTs
            </p>
            <Button onClick={handleConnect} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect MetaMask
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Network Info */}
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{wallet.network}</span>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <code className="flex-1 text-sm font-mono">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Balance</label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{wallet.balance}</span>
                <span className="text-sm text-muted-foreground">AVAX</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Add Funds
            </Button>
            <Button variant="ghost" onClick={handleDisconnect} className="w-full">
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}