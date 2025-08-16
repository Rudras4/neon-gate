import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
  purchaseTicket: (ticketTier: string, price: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  isPurchasing: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await updateWalletInfo(accounts[0]);
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      updateWalletInfo(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
  };

  const updateWalletInfo = async (address: string) => {
    try {
      // Get balance using web3 RPC calls
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert hex balance to decimal and then to ether
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEther = (balanceWei / Math.pow(10, 18)).toFixed(6);
      
      // Get chain ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId'
      });
      
      setBalance(balanceEther);
      setChainId(parseInt(chainIdHex, 16));
    } catch (err) {
      console.error('Error updating wallet info:', err);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await updateWalletInfo(accounts[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setError(null);
  };

  const purchaseTicket = async (ticketTier: string, price: string) => {
    setIsPurchasing(true);
    setError(null);

    try {
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      // Convert AVAX price to Wei (18 decimals)
      const priceInWei = (parseFloat(price) * Math.pow(10, 18)).toString(16);
      
      // Simulate contract interaction for ticket purchase
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x742d35Cc6634C0532925a3b8D0C4E0E4C3E8F8B8', // Mock contract address
          value: `0x${priceInWei}`,
          data: '0x' + 
            // Function selector for buyTicket(string)
            'a9059cbb' + 
            // Encode ticket tier as bytes32
            ticketTier.padEnd(64, '0').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').substring(0, 64)
        }]
      });

      // Update balance after transaction
      await updateWalletInfo(account);
      
      // Simulate NFT minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, txHash };
    } catch (err: any) {
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPurchasing(false);
    }
  };

  const value = {
    isConnected,
    account,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
    purchaseTicket,
    isPurchasing,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
