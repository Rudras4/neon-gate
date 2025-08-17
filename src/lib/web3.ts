import { ethers } from 'ethers';
import { transactionTracker } from './transactionTracker';

// Contract ABIs (updated to match actual deployed contracts)
export const EVENT_FACTORY_ABI = [
  "function createEvent(tuple(string eventName, string eventDescription, uint256 maxOccupancy, uint256[] tierPrices, string[] tierNames, uint256 eventDate, uint256[] tierQuantities) config) external payable returns (address eventContract)",
  "function getOrganizerEvents(address organizer) external view returns (address[] memory)",
  "function getAllEvents() external view returns (address[] memory)",
  "function getEventCreationFee() external view returns (uint256)",
  "function updateCreationFee(uint256 newFee) external",
  "function pause() external",
  "function unpause() external",
  "function withdrawFees() external",
  "function emergencyPause() external",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)"
];

export const EVENT_TICKET_ABI = [
  "function mintTicket(address to, uint256 seatNumber, string memory tierName, string memory metadataURI) external returns (uint256)",
  "function buyTicket(string memory tierName, string memory metadataURI) external payable returns (uint256)",
  "function mintInitialTickets(uint256[] memory tierQuantities, address organizer) external",
  "function getTicket(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 seatNumber, string tier, string metadataURI, address owner, bool exists))",
  "function getSeatNumber(uint256 tokenId) external view returns (uint256)",
  "function getTicketTier(uint256 tokenId) external view returns (string memory)",
  "function getUserTickets(address user) external view returns (uint256[] memory)",
  "function getTier(string memory tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))",
  "function getAllTierNames() external view returns (string[] memory)",
  "function isSeatOccupied(uint256 seatNumber) external view returns (bool)",
  "function getTotalMinted() external view returns (uint256)",
  "function getAvailableSeats() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function approve(address to, uint256 tokenId) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
];

export const TICKET_RESALE_ABI = [
  "function listTicketForResale(address eventContract, uint256 tokenId, uint256 price) external returns (uint256)",
  "function buyResaleTicket(uint256 listingId) external payable",
  "function cancelResaleListing(uint256 listingId) external",
  "function getResaleListings(address eventContract) external view returns (uint256[] memory)",
  "function getListing(uint256 listingId) external view returns (tuple(uint256 listingId, address eventContract, uint256 tokenId, address seller, uint256 price, uint256 timestamp, bool isActive, string metadataURI))",
  "function isTicketListed(address eventContract, uint256 tokenId) external view returns (bool)",
  "function getUserListings(address user) external view returns (uint256[] memory)"
];

// Network configurations
export const NETWORKS = {
  LOCALHOST: {
    chainId: '0x7a69', // 31337
    chainName: 'Hardhat Localhost',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
  AVALANCHE_FUJI: {
    chainId: '0xa869', // 43113
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
};

// Contract addresses (updated after deployment)
export const CONTRACT_ADDRESSES = {
  LOCALHOST: {
    EVENT_FACTORY: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    TICKET_RESALE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
  AVALANCHE_FUJI: {
    EVENT_FACTORY: '0x...', // Will be populated after deployment
    TICKET_RESALE: '0x...', // Will be populated after deployment
  },
  SEPOLIA: {
    EVENT_FACTORY: '0x...', // Will be populated after deployment
    TICKET_RESALE: '0x...', // Will be populated after deployment
  },
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private currentNetwork: string = 'LOCALHOST';

  constructor() {
    // Don't auto-initialize - wait for explicit initialization
  }

  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.ethereum && 
           window.ethereum.isMetaMask;
  }

  private async initializeProvider() {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    // Get current network and force correct detection
    const network = await this.provider.getNetwork();
    const detectedNetwork = this.getNetworkByChainId(network.chainId);
    
    console.log('🔍 Network Detection:');
    console.log('   Raw Chain ID:', network.chainId.toString());
    console.log('   Detected Network:', detectedNetwork);
    console.log('   Previous Network:', this.currentNetwork);
    
    // Force update to detected network
    this.currentNetwork = detectedNetwork;
    
    console.log('✅ Final Network Set:', this.currentNetwork);
  }

  private getNetworkByChainId(chainId: bigint): string {
    switch (chainId.toString()) {
      case '31337':
        return 'LOCALHOST';
      case '43113':
        return 'AVALANCHE_FUJI';
      case '11155111':
        return 'SEPOLIA';
      default:
        return 'LOCALHOST';
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const accounts = await this.provider.send('eth_requestAccounts', []);
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  }

  async switchNetwork(networkName: keyof typeof NETWORKS): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[networkName].chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS[networkName]],
          });
        } catch (addError) {
          throw new Error('Failed to add network to MetaMask');
        }
      } else {
        throw switchError;
      }
    }

    this.currentNetwork = networkName;
    await this.initializeProvider();
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async testContractConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing contract connection...');
      
      if (!this.provider) {
        console.log('📡 Initializing provider...');
        await this.initializeProvider();
      }

      console.log('🌐 Current network:', this.currentNetwork);
      console.log('📋 Contract address:', CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].EVENT_FACTORY,
        EVENT_FACTORY_ABI,
        this.provider
      );

      console.log('📝 Contract instance created, testing connection...');

      // Test basic contract call
      const fee = await contract.getEventCreationFee();
      console.log('✅ Contract connection successful, creation fee:', ethers.formatEther(fee), 'ETH');
      return true;
    } catch (error) {
      console.error('❌ Contract connection failed:', error);
      
      // Provide more specific error information
      if (error.message.includes('network')) {
        console.error('🌐 Network connection issue detected');
      }
      if (error.message.includes('contract')) {
        console.error('📋 Contract address issue detected');
      }
      if (error.message.includes('ABI')) {
        console.error('📝 ABI issue detected');
      }
      
      return false;
    }
  }

  async createEvent(eventConfig: any): Promise<{ txHash: string; gasUsed: string; totalCost: string; eventContractAddress: string }> {
    if (!this.signer) {
      if (!this.provider) {
        await this.initializeProvider();
      }
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
    }

    console.log('🎯 Creating event...');
    console.log('🌐 Current network:', this.currentNetwork);
    console.log('📋 Contract address:', CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY);

    // ✅ IMPROVED: Add retry logic with exponential backoff for circuit breaker errors
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} to create event...`);
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].EVENT_FACTORY,
          EVENT_FACTORY_ABI,
          this.signer
        );

        // Get creation fee
        let creationFee;
        try {
          console.log('💰 Trying getEventCreationFee()...');
          creationFee = await contract.getEventCreationFee();
          console.log('✅ getEventCreationFee() successful:', ethers.formatEther(creationFee), 'ETH');
        } catch (error) {
          console.log('⚠️ getEventCreationFee() failed, using fallback value...');
          console.log('❌ Error details:', error.message);
          
          // Fallback to hardcoded value (0.01 ETH = 10000000000000000 wei)
          creationFee = ethers.parseEther('0.01');
          console.log('🔄 Using fallback creation fee:', ethers.formatEther(creationFee), 'ETH');
          console.log('💡 This is the known contract value from EventFactory.sol');
        }
        
        console.log('📝 Creating event with config:', eventConfig);
        
        // Call createEvent and get the returned contract address
        const tx = await contract.createEvent(eventConfig, { value: creationFee });
        console.log('📤 Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed');
        console.log('📋 Receipt details:', {
          hash: receipt.hash,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString()
        });
        
        // Get transaction hash from multiple possible sources
        const transactionHash = receipt.hash || receipt.transactionHash || tx.hash;
        
        if (!transactionHash) {
          console.error('❌ No transaction hash found in receipt or transaction');
          console.error('Receipt keys:', Object.keys(receipt));
          console.error('Transaction keys:', Object.keys(tx));
          throw new Error('Transaction confirmed but no transaction hash could be retrieved');
        }
        
        console.log('🔗 Using transaction hash:', transactionHash);
        
        // Get the event contract address from the transaction receipt
        let eventContractAddress = '';
        try {
          // Parse the EventCreated event from the transaction receipt
          const eventCreatedEvent = receipt.logs.find((log: any) => {
            try {
              const parsedLog = contract.interface.parseLog(log);
              return parsedLog?.name === 'EventCreated';
            } catch {
              return false;
            }
          });
          
          if (eventCreatedEvent) {
            const parsedLog = contract.interface.parseLog(eventCreatedEvent);
            eventContractAddress = parsedLog.args[0]; // First argument is the event contract address
            console.log('🎯 Event contract address from logs:', eventContractAddress);
          } else {
            console.log('⚠️ EventCreated event not found in logs, trying alternative method...');
            
            // Alternative: Get the latest event from the factory
            const allEvents = await contract.getAllEvents();
            if (allEvents.length > 0) {
              eventContractAddress = allEvents[allEvents.length - 1];
              console.log('🎯 Event contract address from getAllEvents:', eventContractAddress);
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse event contract address from logs:', parseError);
          
          // Fallback: Get the latest event from the factory
          try {
            const allEvents = await contract.getAllEvents();
            if (allEvents.length > 0) {
              eventContractAddress = allEvents[allEvents.length - 1];
              console.log('🎯 Event contract address from getAllEvents (fallback):', eventContractAddress);
            }
          } catch (fallbackError) {
            console.error('❌ Could not get event contract address:', fallbackError);
          }
        }
        
        if (!eventContractAddress) {
          console.warn('⚠️ Could not determine event contract address');
        }
        
        // Track the transaction
        try {
          await transactionTracker.trackTransaction(transactionHash, 'EVENT_CREATION', {
            eventConfig,
            creationFee: creationFee.toString(),
            eventContractAddress
          });
          console.log('📊 Transaction tracked successfully');
        } catch (trackingError) {
          console.warn('⚠️ Transaction tracking failed, but event creation was successful:', trackingError.message);
          // Don't fail the entire operation if tracking fails
        }
        
        // Calculate gas cost
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice || 0n;
        const gasCost = gasUsed * gasPrice;
        const totalCost = creationFee + gasCost;
        
        console.log('⛽ Gas used:', gasUsed.toString());
        console.log('💸 Total cost:', ethers.formatEther(totalCost), 'ETH');
        console.log('🎯 Event contract address:', eventContractAddress);
        
        return {
          txHash: transactionHash,
          gasUsed: gasUsed.toString(),
          totalCost: totalCost.toString(),
          eventContractAddress
        };
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        // Check if this is a circuit breaker error
        if (error.message.includes('circuit breaker') || 
            error.message.includes('Execution prevented') ||
            error.code === -32603) {
          console.log('🚫 Circuit breaker error detected');
          
          if (attempt < maxRetries) {
            // Exponential backoff: wait 2^attempt seconds
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error(`Circuit breaker error after ${maxRetries} attempts. Please wait a few minutes and try again.`);
          }
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('Event creation failed after all retry attempts');
  }

  async mintTicket(eventContractAddress: string, to: string, seatNumber: number, tier: string, metadataURI: string): Promise<string> {
    if (!this.signer) {
      if (!this.provider) {
        await this.initializeProvider();
      }
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
    }

    const contract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.signer);
    
    const tx = await contract.mintTicket(to, seatNumber, tier, metadataURI);
    const receipt = await tx.wait();
    
    // Track the transaction
    await transactionTracker.trackTransaction(receipt.transactionHash, 'TICKET_PURCHASE', {
      eventContract: eventContractAddress,
      to,
      seatNumber,
      tier,
      metadataURI
    });
    
    return receipt.transactionHash;
  }

  // ✅ ADD: buyTicket function for purchasing tickets
  async buyTicket(eventContractAddress: string, tier: string, metadataURI: string, price: string): Promise<string> {
    if (!this.signer) {
      if (!this.provider) {
        await this.initializeProvider();
      }
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
    }

    const contract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.signer);
    
    try {
      // ✅ FIX: Ensure price is in wei and handle payment
      const priceInWei = typeof price === 'string' ? ethers.parseEther(price) : price;
      
      console.log('🎫 Purchasing ticket:', {
        eventContract: eventContractAddress,
        tier,
        metadataURI,
        price: priceInWei.toString(),
        priceInEth: ethers.formatEther(priceInWei)
      });
      
      // Call buyTicket with payment
      const tx = await contract.buyTicket(tier, metadataURI, { value: priceInWei });
      console.log('📤 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed');
      
      // Track the transaction
      await transactionTracker.trackTransaction(receipt.transactionHash, 'TICKET_PURCHASE', {
        eventContract: eventContractAddress,
        tier,
        metadataURI,
        price: priceInWei.toString()
      });
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('❌ Ticket purchase failed:', error);
      throw error;
    }
  }

  async listTicketForResale(eventContractAddress: string, tokenId: number, price: string): Promise<string> {
    if (!this.signer) {
      if (!this.provider) {
        await this.initializeProvider();
      }
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
    }

    // First approve the resale contract
    const ticketContract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.signer);
    const resaleContractAddress = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].TICKET_RESALE;
    
    const approveTx = await ticketContract.approve(resaleContractAddress, tokenId);
    await approveTx.wait();

    // Then list for resale
    const resaleContract = new ethers.Contract(resaleContractAddress, TICKET_RESALE_ABI, this.signer);
    const priceInWei = ethers.parseEther(price);
    
    const tx = await resaleContract.listTicketForResale(eventContractAddress, tokenId, priceInWei);
    const receipt = await tx.wait();
    
    // Track the transaction
    await transactionTracker.trackTransaction(receipt.transactionHash, 'TICKET_RESALE', {
      eventContract: eventContractAddress,
      tokenId,
      price,
      priceInWei: priceInWei.toString()
    });
    
    return receipt.transactionHash;
  }

  async buyResaleTicket(listingId: number, price: string): Promise<string> {
    if (!this.signer) {
      if (!this.provider) {
        await this.initializeProvider();
      }
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
    }

    const resaleContract = new ethers.Contract(
      CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].TICKET_RESALE,
      TICKET_RESALE_ABI,
      this.signer
    );

    const priceInWei = ethers.parseEther(price);
    
    const tx = await resaleContract.buyResaleTicket(listingId, { value: priceInWei });
    const receipt = await tx.wait();
    
    // Track the transaction
    await transactionTracker.trackTransaction(receipt.transactionHash, 'TICKET_BUY_RESALE', {
      listingId,
      price,
      priceInWei: priceInWei.toString()
    });
    
    return receipt.transactionHash;
  }

  async getResaleListings(eventContractAddress: string): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const resaleContract = new ethers.Contract(
      CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].TICKET_RESALE,
      TICKET_RESALE_ABI,
      this.provider
    );

    const listingIds = await resaleContract.getResaleListings(eventContractAddress);
    const listings = [];

    for (const listingId of listingIds) {
      const listing = await resaleContract.getListing(listingId);
      listings.push({
        listingId: listing.listingId.toString(),
        eventContract: listing.eventContract,
        tokenId: listing.tokenId.toString(),
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        timestamp: listing.timestamp.toString(),
        isActive: listing.isActive,
        metadataURI: listing.metadataURI
      });
    }

    return listings;
  }

  async getTicketInfo(eventContractAddress: string, tokenId: number): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const contract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.provider);
    const ticket = await contract.getTicket(tokenId);
    
    return {
      tokenId: ticket.tokenId.toString(),
      seatNumber: ticket.seatNumber.toString(),
      tier: ticket.tier,
      metadataURI: ticket.metadataURI,
      owner: ticket.owner,
      exists: ticket.exists
    };
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  async getNetworkInfo(): Promise<{ chainId: string; networkName: string; contractAddress: string }> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    const network = await this.provider!.getNetwork();
    const chainId = network.chainId.toString();
    const networkName = this.getNetworkByChainId(network.chainId);
    const contractAddress = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY || 'Not configured';

    return {
      chainId,
      networkName,
      contractAddress
    };
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  async diagnoseNetworkIssue(): Promise<string> {
    try {
      console.log('🔍 Diagnosing network issue...');
      
      // Check MetaMask availability
      if (!this.isMetaMaskAvailable()) {
        return 'MetaMask is not available';
      }
      
      // Check if provider is initialized
      if (!this.provider) {
        return 'Provider not initialized - try connecting wallet first';
      }
      
      // Check current network
      const network = await this.provider.getNetwork();
      const chainId = network.chainId.toString();
      const detectedNetwork = this.getNetworkByChainId(network.chainId);
      
      console.log('🌐 Current Network State:');
      console.log('   Chain ID:', chainId);
      console.log('   Detected Network:', detectedNetwork);
      console.log('   Expected Network:', 'LOCALHOST');
      console.log('   Expected Chain ID:', '31337');
      
      // Check if we're on the right network
      if (chainId !== '31337') {
        return `Wrong network detected. Current: ${chainId}, Expected: 31337. Please switch to Hardhat Localhost in MetaMask.`;
      }
      
      // Check if contract addresses are configured
      const contractAddress = CONTRACT_ADDRESSES[detectedNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY;
      if (!contractAddress || contractAddress === '0x...') {
        return 'Contract addresses not configured for current network';
      }
      
      // Try to connect to contract
      try {
        const contract = new ethers.Contract(contractAddress, EVENT_FACTORY_ABI, this.provider);
        await contract.getEventCreationFee();
        return 'Network connection successful - no issues detected';
      } catch (contractError) {
        return `Contract connection failed: ${contractError.message}`;
      }
      
    } catch (error) {
      return `Diagnosis failed: ${error.message}`;
    }
  }

  async checkNetworkStatus(): Promise<void> {
    try {
      console.log('🔍 Checking network status...');
      
      if (!this.provider) {
        console.log('❌ Provider not initialized');
        return;
      }

      const network = await this.provider.getNetwork();
      console.log('🌐 Network Info:');
      console.log('   Chain ID:', network.chainId.toString());
      console.log('   Network Name:', network.name || 'Unknown');
      
      console.log('📱 MetaMask Info:');
      console.log('   Available:', this.isMetaMaskAvailable());
      console.log('   Connected:', this.isConnected());
      
      console.log('📋 Contract Addresses:');
      console.log('   Current Network:', this.currentNetwork);
      console.log('   EventFactory:', CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY);
      console.log('   TicketResale:', CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.TICKET_RESALE);
      
    } catch (error) {
      console.error('❌ Error checking network status:', error);
    }
  }

  async simpleTest(): Promise<string> {
    try {
      console.log('🧪 Simple connection test...');
      
      if (!this.provider) {
        await this.initializeProvider();
      }
      
      const network = await this.provider!.getNetwork();
      console.log('🌐 Network:', network.chainId.toString());
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].EVENT_FACTORY,
        EVENT_FACTORY_ABI,
        this.provider
      );
      
      const fee = await contract.getEventCreationFee();
      return `✅ Success! Fee: ${ethers.formatEther(fee)} ETH`;
      
    } catch (error) {
      return `❌ Failed: ${error.message}`;
    }
  }

  async debugContractCall(): Promise<string> {
    try {
      console.log('🔍 Debugging contract call...');
      
      // Step 1: Check if provider exists
      if (!this.provider) {
        console.log('📡 No provider, initializing...');
        await this.initializeProvider();
      }
      
      // Step 2: Check network
      const network = await this.provider!.getNetwork();
      console.log('🌐 Network Chain ID:', network.chainId.toString());
      
      // Step 3: Check contract address
      const contractAddress = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY;
      console.log('📋 Contract Address:', contractAddress);
      
      // Step 4: Create contract instance
      console.log('📝 Creating contract instance...');
      const contract = new ethers.Contract(
        contractAddress,
        EVENT_FACTORY_ABI,
        this.provider
      );
      console.log('✅ Contract instance created');
      
      // Step 5: Try to call the function
      console.log('📞 Calling getEventCreationFee()...');
      const fee = await contract.getEventCreationFee();
      console.log('💰 Fee received:', ethers.formatEther(fee), 'ETH');
      
      return `✅ All steps successful! Fee: ${ethers.formatEther(fee)} ETH`;
      
    } catch (error) {
      console.error('❌ Debug failed at step:', error);
      return `❌ Failed: ${error.message}`;
    }
  }

  async testContractDirectly(): Promise<string> {
    try {
      console.log('🧪 Testing contract directly...');
      
      if (!this.provider) {
        await this.initializeProvider();
      }
      
      const contractAddress = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY;
      console.log('📋 Contract Address:', contractAddress);
      
      // Use the simplified ABI (no duplicate functions)
      const simplifiedABI = [
        "function getEventCreationFee() external view returns (uint256)"
      ];
      
      const contract = new ethers.Contract(contractAddress, simplifiedABI, this.provider);
      
      console.log('📞 Testing getEventCreationFee...');
      const fee = await contract.getEventCreationFee();
      console.log('✅ getEventCreationFee result:', fee.toString());
      console.log('💰 Fee in ETH:', ethers.formatEther(fee), 'ETH');
      
      return `✅ Success! Fee: ${ethers.formatEther(fee)} ETH (${fee.toString()} wei)`;
      
    } catch (error) {
      console.error('❌ Direct test failed:', error);
      return `❌ Failed: ${error.message}`;
    }
  }

  async checkEventCreationStatus(eventConfig: any): Promise<string> {
    try {
      console.log('🔍 Checking event creation status...');
      
      if (!this.provider) {
        await this.initializeProvider();
      }
      
      const contractAddress = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY;
      console.log('📋 EventFactory Address:', contractAddress);
      
      const contract = new ethers.Contract(contractAddress, EVENT_FACTORY_ABI, this.provider);
      
      // Get all events
      const allEvents = await contract.getAllEvents();
      console.log('📋 Total events created:', allEvents.length);
      
      if (allEvents.length === 0) {
        return '❌ No events found - event creation may have failed';
      }
      
      // Get the latest event (should be the one just created)
      const latestEventAddress = allEvents[allEvents.length - 1];
      console.log('🎯 Latest event contract address:', latestEventAddress);
      
      // Check if this event contract exists and has the right name
      const eventTicketContract = new ethers.Contract(latestEventAddress, EVENT_TICKET_ABI, this.provider);
      
      try {
        const eventName = await eventTicketContract.name();
        console.log('📝 Event name:', eventName);
        
        if (eventName === eventConfig.eventName) {
          return `✅ Event created successfully! Contract: ${latestEventAddress.slice(0, 10)}...${latestEventAddress.slice(-8)}`;
        } else {
          return `⚠️ Event created but name mismatch. Expected: ${eventConfig.eventName}, Got: ${eventName}`;
        }
      } catch (nameError) {
        console.log('⚠️ Could not get event name, but event contract exists');
        return `✅ Event contract created at: ${latestEventAddress.slice(0, 10)}...${latestEventAddress.slice(-8)}`;
      }
      
    } catch (error) {
      console.error('❌ Error checking event status:', error);
      return `❌ Failed to check event status: ${error.message}`;
    }
  }

  // Get EventFactory address for current network
  getEventFactoryAddress(): string {
    const address = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES]?.EVENT_FACTORY;
    if (!address) {
      throw new Error(`EventFactory address not found for network: ${this.currentNetwork}`);
    }
    return address;
  }

  // Get user's NFT tickets from all event contracts
  async getUserNFTTickets(userAddress: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching NFT tickets for user:', userAddress);
      
      if (!this.provider) {
        await this.initializeProvider();
      }
      
      const eventFactoryAddress = this.getEventFactoryAddress();
      const eventFactory = new ethers.Contract(eventFactoryAddress, EVENT_FACTORY_ABI, this.provider);
      
      // Get all events created by the factory
      const allEvents = await eventFactory.getAllEvents();
      console.log('📋 Found event contracts:', allEvents.length);
      
      const userNFTs: any[] = [];
      
      // Check each event contract for user's tickets
      for (const eventContractAddress of allEvents) {
        try {
          const eventContract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.provider);
          
          // Get user's tickets from this event
          const userTicketIds = await eventContract.getUserTickets(userAddress);
          console.log(`🎫 User has ${userTicketIds.length} tickets in event ${eventContractAddress.slice(0, 10)}...`);
          
          // Get details for each ticket
          for (const tokenId of userTicketIds) {
            try {
              const ticket = await eventContract.getTicket(tokenId);
              const eventName = await eventContract.eventName();
              const eventDate = await eventContract.eventDate();
              
              const nftTicket = {
                tokenId: tokenId.toString(),
                eventContract: eventContractAddress,
                eventName: eventName,
                eventDate: new Date(Number(eventDate) * 1000).toLocaleDateString(),
                tier: ticket.tier,
                seatNumber: ticket.seatNumber.toString(),
                metadataURI: ticket.metadataURI,
                owner: ticket.owner,
                purchaseDate: new Date().toLocaleDateString(), // We'll enhance this later
                network: this.currentNetwork,
                isNFT: true
              };
              
              userNFTs.push(nftTicket);
              console.log('🎫 NFT ticket details:', nftTicket);
              
            } catch (ticketError) {
              console.warn(`⚠️ Could not get details for token ${tokenId}:`, ticketError);
            }
          }
          
        } catch (eventError) {
          console.warn(`⚠️ Could not access event contract ${eventContractAddress}:`, eventError);
        }
      }
      
      console.log('🎯 Total NFT tickets found:', userNFTs.length);
      return userNFTs;
      
    } catch (error) {
      console.error('❌ Error fetching user NFT tickets:', error);
      throw error;
    }
  }

  // Get ticket metadata from blockchain
  async getTicketMetadata(eventContractAddress: string, tokenId: number): Promise<any> {
    try {
      console.log('🔍 Fetching metadata for ticket:', { eventContractAddress, tokenId });
      
      if (!this.provider) {
        await this.initializeProvider();
      }
      
      const eventTicketContract = new ethers.Contract(
        eventContractAddress,
        EVENT_TICKET_ABI,
        this.provider
      );
      
      // Get token URI
      const tokenURI = await eventTicketContract.tokenURI(tokenId);
      console.log('📋 Token URI:', tokenURI);
      
      if (!tokenURI || tokenURI === '') {
        console.log('⚠️ No token URI found, returning fallback metadata');
        return {
          tier: 'Standard',
          seatNumber: tokenId.toString(),
          price: '0'
        };
      }
      
      // Fetch metadata from URI
      const metadata = await this.fetchMetadata(tokenURI);
      console.log('✅ Ticket metadata:', metadata);
      
      return metadata;
    } catch (error) {
      console.error('❌ Error fetching ticket metadata:', error);
      // Return fallback metadata
      return {
        tier: 'Standard',
        seatNumber: tokenId.toString(),
        price: '0'
      };
    }
  }

  // Fetch metadata from URI
  private async fetchMetadata(uri: string): Promise<any> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Failed to fetch metadata from URI:', error);
      return null;
    }
  }
}

// Export singleton instance
export const web3Service = new Web3Service();
