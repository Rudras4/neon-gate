import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service, NETWORKS } from '@/lib/web3';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  currentNetwork: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkName: keyof typeof NETWORKS) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  purchaseTicket: (eventContractAddress: string, tier: string, seatNumber: number, price: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  listTicketForResale: (eventContractAddress: string, tokenId: number, price: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  buyResaleTicket: (listingId: number, price: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  createEvent: (eventConfig: any) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  isPurchasing: boolean;
  isListing: boolean;
  isCreatingEvent: boolean;
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
  const [currentNetwork, setCurrentNetwork] = useState<string>('LOCALHOST');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

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
      // Only check connection if MetaMask is available
      if (!web3Service.isMetaMaskAvailable()) {
        return;
      }

      if (web3Service.isConnected()) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Get current network from MetaMask
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const chainIdNumber = parseInt(chainId, 16);
          setChainId(chainIdNumber);
          
          // Update current network based on chainId
          if (chainIdNumber === 31337) {
            setCurrentNetwork('LOCALHOST');
          } else if (chainIdNumber === 43113) {
            setCurrentNetwork('AVALANCHE_FUJI');
          } else if (chainIdNumber === 11155111) {
            setCurrentNetwork('SEPOLIA');
          }
          
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
    const chainIdNumber = parseInt(chainId, 16);
    setChainId(chainIdNumber);
    
    // Update current network based on chainId
    if (chainIdNumber === 31337) {
      setCurrentNetwork('LOCALHOST');
    } else if (chainIdNumber === 43113) {
      setCurrentNetwork('AVALANCHE_FUJI');
    } else if (chainIdNumber === 11155111) {
      setCurrentNetwork('SEPOLIA');
    }
    
    // Update wallet info if account is connected
    if (account) {
      updateWalletInfo(account);
    }
  };

  const updateWalletInfo = async (address: string) => {
    try {
      const balance = await web3Service.getBalance(address);
      setBalance(balance);
      setCurrentNetwork(web3Service.getCurrentNetwork());
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

      const account = await web3Service.connectWallet();
      setAccount(account);
      setIsConnected(true);
      await updateWalletInfo(account);
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

  const switchNetwork = async (networkName: keyof typeof NETWORKS) => {
    setIsLoading(true);
    setError(null);

    try {
      await web3Service.switchNetwork(networkName);
      setCurrentNetwork(networkName);
      
      if (account) {
        await updateWalletInfo(account);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      console.error('Error switching network:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseTicket = async (eventContractAddress: string, tier: string, seatNumber: number, price: string) => {
    setIsPurchasing(true);
    setError(null);

    try {
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      // Generate metadata URI (in production, this would be uploaded to IPFS)
      const metadataURI = `ipfs://Qm${Math.random().toString(36).substring(2)}`;
      
      const txHash = await web3Service.mintTicket(eventContractAddress, account, seatNumber, tier, metadataURI);
      
      // Update balance after transaction
      await updateWalletInfo(account);
      
      return { success: true, txHash };
    } catch (err: any) {
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPurchasing(false);
    }
  };

  const listTicketForResale = async (eventContractAddress: string, tokenId: number, price: string) => {
    setIsListing(true);
    setError(null);

    try {
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      const txHash = await web3Service.listTicketForResale(eventContractAddress, tokenId, price);
      
      return { success: true, txHash };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to list ticket for resale';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsListing(false);
    }
  };

  const buyResaleTicket = async (listingId: number, price: string) => {
    setIsPurchasing(true);
    setError(null);

    try {
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      const txHash = await web3Service.buyResaleTicket(listingId, price);
      
      // Update balance after transaction
      await updateWalletInfo(account);
      
      return { success: true, txHash };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to buy resale ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPurchasing(false);
    }
  };

  const createEvent = async (eventConfig: any) => {
    setIsCreatingEvent(true);
    setError(null);

    try {
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet first');
      }

      const result = await web3Service.createEvent(eventConfig);
      
      // Update balance after transaction
      await updateWalletInfo(account);
      
      // Show success message with transaction details
      console.log('Event created successfully!', {
        txHash: result.txHash,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost
      });
      
      return { 
        success: true, 
        txHash: result.txHash,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create event';
      setError(errorMessage);
      console.error('Error creating event:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const value = {
    isConnected,
    account,
    balance,
    chainId,
    currentNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isLoading,
    error,
    purchaseTicket,
    listTicketForResale,
    buyResaleTicket,
    createEvent,
    isPurchasing,
    isListing,
    isCreatingEvent,
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
