import { ethers } from 'ethers';

// Contract ABIs (these will be generated from our compiled contracts)
export const EVENT_FACTORY_ABI = [
  "function createEvent(tuple(string eventName, string eventDescription, uint256 maxOccupancy, uint256[] tierPrices, string[] tierNames, uint256 eventDate, uint256[] tierQuantities) config) external payable returns (address eventContract)",
  "function getOrganizerEvents(address organizer) external view returns (address[] memory)",
  "function eventCreationFee() external view returns (uint256)",
  "function allEvents() external view returns (address[] memory)"
];

export const EVENT_TICKET_ABI = [
  "function mintTicket(address to, uint256 seatNumber, string memory tierName, string memory metadataURI) external returns (uint256)",
  "function mintInitialTickets(uint256[] memory tierQuantities, address organizer) external",
  "function getTicket(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 seatNumber, string tier, string metadataURI, address owner, bool exists))",
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
  "function isTicketListed(address eventContract, uint256 tokenId) external view returns (bool)"
];

// Network configurations
export const NETWORKS = {
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

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
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
  private currentNetwork: string = 'AVALANCHE_FUJI';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get current network
      const network = await this.provider.getNetwork();
      this.currentNetwork = this.getNetworkByChainId(network.chainId);
    }
  }

  private getNetworkByChainId(chainId: bigint): string {
    switch (chainId.toString()) {
      case '43113':
        return 'AVALANCHE_FUJI';
      case '11155111':
        return 'SEPOLIA';
      default:
        return 'AVALANCHE_FUJI';
    }
  }

  async connectWallet(): Promise<string> {
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
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async createEvent(eventConfig: any): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].EVENT_FACTORY,
      EVENT_FACTORY_ABI,
      this.signer
    );

    const creationFee = await contract.eventCreationFee();
    
    const tx = await contract.createEvent(eventConfig, { value: creationFee });
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  async mintTicket(eventContractAddress: string, to: string, seatNumber: number, tier: string, metadataURI: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const contract = new ethers.Contract(eventContractAddress, EVENT_TICKET_ABI, this.signer);
    
    const tx = await contract.mintTicket(to, seatNumber, tier, metadataURI);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  async listTicketForResale(eventContractAddress: string, tokenId: number, price: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
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
    
    return receipt.transactionHash;
  }

  async buyResaleTicket(listingId: number, price: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const resaleContract = new ethers.Contract(
      CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES].TICKET_RESALE,
      TICKET_RESALE_ABI,
      this.signer
    );

    const priceInWei = ethers.parseEther(price);
    
    const tx = await resaleContract.buyResaleTicket(listingId, { value: priceInWei });
    const receipt = await tx.wait();
    
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

  isConnected(): boolean {
    return this.signer !== null;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();
