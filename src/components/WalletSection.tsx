import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ExternalLink, Zap } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";

export function WalletSection() {
  const { isConnected, account, balance, chainId, connectWallet, disconnectWallet, isLoading, error } = useWallet();
  const [copySuccess, setCopySuccess] = useState(false);

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 43114: return "Avalanche Mainnet";
      case 43113: return "Avalanche Fuji Testnet";
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      default: return "Unknown Network";
    }
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
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

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

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
            <Button onClick={connectWallet} disabled={isLoading} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Network Info */}
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{getNetworkName(chainId)}</span>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <code className="flex-1 text-sm font-mono">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className={`h-4 w-4 ${copySuccess ? 'text-green-500' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open(`https://snowtrace.io/address/${account}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {copySuccess && (
              <p className="text-xs text-green-600">Address copied to clipboard!</p>
            )}
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Balance</label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {balance ? parseFloat(balance).toFixed(4) : "0.0000"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {chainId === 43114 || chainId === 43113 ? "AVAX" : "ETH"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://core.app/', '_blank')}
            >
              Add Funds
            </Button>
            <Button variant="ghost" onClick={disconnectWallet} className="w-full">
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}