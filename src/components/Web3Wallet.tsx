import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Network, LogOut, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet, NETWORKS } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

export function Web3Wallet() {
  const { 
    isConnected, 
    account, 
    balance, 
    currentNetwork, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork, 
    isLoading, 
    error 
  } = useWallet();
  
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
      variant: "default",
    });
  };

  const handleNetworkSwitch = async (networkName: string) => {
    try {
      await switchNetwork(networkName as keyof typeof NETWORKS);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${NETWORKS[networkName as keyof typeof NETWORKS]?.chainName || networkName}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
    }
  };

  const addLocalhostNetwork = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
        return;
      }

      // First add the network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7a69', // 31337
          chainName: 'Hardhat Localhost',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['http://127.0.0.1:8545'],
          blockExplorerUrls: [],
        }],
      });

      toast({
        title: "Network Added",
        description: "Localhost network has been added to MetaMask",
        variant: "default",
      });

      // Then switch to the localhost network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }],
        });
        
        toast({
          title: "Network Switched",
          description: "Successfully switched to Hardhat Localhost",
          variant: "default",
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          toast({
            title: "Network Switch Failed",
            description: "Please manually switch to Hardhat Localhost network",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Network Addition Cancelled",
          description: "User rejected the network addition",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Network Addition Failed",
          description: error.message || "Failed to add network",
          variant: "destructive",
        });
      }
    }
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNetworkIcon = (networkName: string) => {
    switch (networkName) {
      case 'AVALANCHE_FUJI':
        return '❄️';
      case 'SEPOLIA':
        return '🔷';
      default:
        return '🌐';
    }
  };

  const getNetworkColor = (networkName: string) => {
    switch (networkName) {
      case 'AVALANCHE_FUJI':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SEPOLIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const switchToLocalhost = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
        return;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      });
      
      toast({
        title: "Network Switched",
        description: "Successfully switched to Hardhat Localhost",
        variant: "default",
      });
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          title: "Network Not Found",
          description: "Please add the localhost network first using 'Add Localhost' button",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Network Switch Failed",
          description: error.message || "Failed to switch network",
          variant: "destructive",
        });
      }
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Connect your MetaMask wallet to interact with Web3 features
          </p>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Make sure you have MetaMask installed in your browser
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Network</label>
          <div className="flex gap-2">
            <Select value={currentNetwork} onValueChange={handleNetworkSwitch}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NETWORKS).map(([key, network]) => (
                  <SelectItem key={key} value={key}>
                    {network.chainName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addLocalhostNetwork}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              Add Localhost
            </Button>
            <Button
              onClick={switchToLocalhost}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              Switch to Localhost
            </Button>
          </div>
        </div>

        {/* Current Network Badge */}
        <div className="flex justify-center">
          <Badge className={getNetworkColor(currentNetwork)}>
            <Network className="mr-1 h-3 w-3" />
            {currentNetwork}
          </Badge>
        </div>

        {/* Account Info */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Account</label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <span className="text-sm font-mono text-gray-700 flex-1">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Balance</label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-center">
              <span className="text-lg font-bold text-blue-700">
                {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
              </span>
              <span className="text-sm text-blue-600 ml-1">
                {currentNetwork === 'AVALANCHE_FUJI' ? 'AVAX' : 'ETH'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Disconnect Button */}
        <Button 
          onClick={handleDisconnect} 
          variant="outline" 
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
