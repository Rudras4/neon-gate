# 🚀 Smart Contracts Setup & Integration Guide

## 📋 Overview

This directory contains the smart contracts for the Ticketchain Web3 pivot, implementing:
- **EventFactory**: Creates new event collections (NFT collections)
- **EventTicket**: ERC-721 tickets with seat mapping (1-N occupancy)
- **TicketResale**: P2P resale marketplace integrated with existing UI

## 🏗️ Architecture

```
EventFactory → Creates → EventTicket (NFT Collection)
     ↓
TicketResale ← Integrates with → Existing P2P Resale UI
```

### Key Features
- **Event Creation**: Pay gas fee → Deploy contract → Mint N tickets
- **Seat Mapping**: Each ticket represents one seat (1-N occupancy)
- **Tier System**: Multiple ticket tiers with different pricing
- **P2P Resale**: Use existing resale UI with blockchain backend
- **Cross-Chain**: Support for Avalanche Fuji + Sepolia testnets

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and fill in your values:
```bash
# Smart Contract Deployment
PRIVATE_KEY=your_private_key_here

# Infura Configuration (for Sepolia)
INFURA_PROJECT_ID=your_infura_project_id_here

# API Keys for Contract Verification
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Run Tests
```bash
npm run test
```

## 🚀 Deployment

### Deploy to Avalanche Fuji Testnet
```bash
npm run deploy:fuji
```

### Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Verify Contracts
```bash
# Avalanche Fuji
npm run verify:fuji

# Sepolia
npm run verify:sepolia
```

## 📱 Frontend Integration

### 1. Contract Addresses
After deployment, update your frontend with the contract addresses:
```typescript
// src/lib/contracts.ts
export const CONTRACTS = {
  AVALANCHE_FUJI: {
    EVENT_FACTORY: "0x...",
    TICKET_RESALE: "0x..."
  },
  SEPOLIA: {
    EVENT_FACTORY: "0x...",
    TICKET_RESALE: "0x..."
  }
};
```

### 2. Web3 Integration
Update your existing components to use smart contracts:

#### Event Creation (Web3)
```typescript
import { ethers } from 'ethers';
import { EventFactory__factory } from '../typechain-types';

const createEventOnChain = async (eventData: EventData) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  const factory = EventFactory__factory.connect(
    CONTRACTS.AVALANCHE_FUJI.EVENT_FACTORY,
    signer
  );
  
  const tx = await factory.createEvent(
    {
      eventName: eventData.name,
      eventDescription: eventData.description,
      maxOccupancy: eventData.maxOccupancy,
      tierPrices: eventData.tierPrices,
      tierNames: eventData.tierNames,
      eventDate: eventData.date,
      tierQuantities: eventData.tierQuantities
    },
    { value: ethers.utils.parseEther("0.01") }
  );
  
  return await tx.wait();
};
```

#### Ticket Purchase (NFT Minting)
```typescript
import { EventTicket__factory } from '../typechain-types';

const purchaseTicket = async (eventContract: string, tier: string, seatNumber: number) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  const ticketContract = EventTicket__factory.connect(eventContract, signer);
  
  const tx = await ticketContract.mintTicket(
    account,
    seatNumber,
    tier,
    `ipfs://${metadataHash}`
  );
  
  return await tx.wait();
};
```

#### P2P Resale Integration
```typescript
import { TicketResale__factory } from '../typechain-types';

// List ticket for resale
const listTicketForResale = async (eventContract: string, tokenId: number, price: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  const resaleContract = TicketResale__factory.connect(
    CONTRACTS.AVALANCHE_FUJI.TICKET_RESALE,
    signer
  );
  
  // First approve resale contract to transfer ticket
  const ticketContract = EventTicket__factory.connect(eventContract, signer);
  await ticketContract.approve(CONTRACTS.AVALANCHE_FUJI.TICKET_RESALE, tokenId);
  
  // Then list on resale marketplace
  const tx = await resaleContract.listTicketForResale(
    eventContract,
    tokenId,
    ethers.utils.parseEther(price)
  );
  
  return await tx.wait();
};

// Buy resale ticket
const buyResaleTicket = async (listingId: number, price: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  const resaleContract = TicketResale__factory.connect(
    CONTRACTS.AVALANCHE_FUJI.TICKET_RESALE,
    signer
  );
  
  const tx = await resaleContract.buyResaleTicket(listingId, {
    value: ethers.utils.parseEther(price)
  });
  
  return await tx.wait();
};
```

### 3. Update Existing Components

#### EventTickets.tsx
Update your existing P2P resale tab to use smart contracts:
```typescript
// Replace mock data with blockchain data
const [resaleTickets, setResaleTickets] = useState([]);

useEffect(() => {
  const fetchResaleTickets = async () => {
    if (isConnected && eventContractAddress) {
      const resaleContract = TicketResale__factory.connect(
        CONTRACTS.AVALANCHE_FUJI.TICKET_RESALE,
        signer
      );
      
      const listings = await resaleContract.getResaleListings(eventContractAddress);
      setResaleTickets(listings);
    }
  };
  
  fetchResaleTickets();
}, [isConnected, eventContractAddress]);
```

## 🔧 Smart Contract Functions

### EventFactory
- `createEvent(EventConfig)`: Create new event collection
- `getOrganizerEvents(address)`: Get events by organizer
- `getAllEvents()`: Get all events
- `updateCreationFee(uint256)`: Update creation fee (owner only)

### EventTicket
- `mintTicket(address, uint256, string, string)`: Mint ticket for specific seat
- `getSeatNumber(uint256)`: Get seat number by token ID
- `getTicketTier(uint256)`: Get tier by token ID
- `getUserTickets(address)`: Get user's tickets
- `getAvailableSeats()`: Get available seats count

### TicketResale
- `listTicketForResale(address, uint256, uint256)`: List ticket for resale
- `buyResaleTicket(uint256)`: Buy listed ticket
- `cancelResaleListing(uint256)`: Cancel listing
- `getResaleListings(address)`: Get resale listings for event
- `getUserActiveListings(address)`: Get user's active listings

## 🌐 Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io
- **Gas Token**: AVAX

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/{PROJECT_ID}
- **Explorer**: https://sepolia.etherscan.io
- **Gas Token**: ETH

## 💰 Economic Model

### Event Creation
- **Avalanche Fuji**: ~0.01 AVAX (gas fee)
- **Sepolia**: ~0.001 ETH (gas fee)

### Ticket Minting
- **Per Ticket**: ~0.001 AVAX/ETH (gas fee)
- **Batch Minting**: Discounted rates

### Resale Fees
- **Listing Fee**: 0.5% of ticket price
- **Transaction Fee**: 2.5% of sale price

## 🔐 Security Features

- **OpenZeppelin**: Standard contract implementations
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter checks

## 📊 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Test
```bash
npx hardhat test test/EventFactory.test.ts
```

### Test Coverage
```bash
npx hardhat coverage
```

## 🚨 Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Check Solidity version compatibility
   - Ensure all imports are correct
   - Verify OpenZeppelin contract versions

2. **Deployment Failures**
   - Check network configuration
   - Verify private key format
   - Ensure sufficient gas balance

3. **Transaction Failures**
   - Check gas limits
   - Verify contract addresses
   - Ensure proper approvals

### Debug Commands
```bash
# Check contract bytecode
npx hardhat run scripts/deploy.ts --network localhost

# Verify contract on explorer
npx hardhat verify --network fuji CONTRACT_ADDRESS

# Get contract info
npx hardhat console --network fuji
```

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Avalanche Documentation](https://docs.avax.network/)
- [Ethereum Development](https://ethereum.org/developers/)

## 🎯 Next Steps

1. **Deploy to Testnets**: Deploy contracts to Avalanche Fuji and Sepolia
2. **Frontend Integration**: Update React components to use smart contracts
3. **Testing**: Comprehensive testing on testnets
4. **Mainnet Deployment**: Deploy to mainnet after security audit
5. **Community Launch**: Launch at hackathon with live demo

---

**This setup transforms your traditional ticketing app into a cutting-edge Web3 platform while maintaining your existing UI/UX!**
