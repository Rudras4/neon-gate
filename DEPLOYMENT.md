# 🚀 Smart Contract Deployment Plan

## 🎯 **Deployment Target: Sepolia Testnet (Ethereum)**

### 📋 **Pre-Deployment Checklist**
- [x] Smart contracts compiled and tested locally
- [x] Hardhat configuration ready for Sepolia network
- [x] Deployment scripts prepared
- [x] Wallet address: `0x75BAe1084Bb654C0a9bfA3c1EEDCA4e61acB6452`
- [x] Private key added to .env.local

### 🌐 **Network Configuration**
- **Network**: Sepolia Testnet (Ethereum)
- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.infura.io/v3/{INFURA_PROJECT_ID}`
- **Block Explorer**: `https://sepolia.etherscan.io/`
- **Gas Token**: ETH (testnet)

### 📜 **Contracts to Deploy**
1. **EventFactory** - Event collection factory contract
2. **TicketResale** - P2P resale marketplace contract

### 💰 **Estimated Costs**
- **EventFactory Deployment**: ~0.001 ETH (gas)
- **TicketResale Deployment**: ~0.001 ETH (gas)
- **Total Estimated**: ~0.002 ETH

### 🚀 **Deployment Steps**

#### Step 1: Environment Setup ✅
```bash
# .env.local file configured with:
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=fc44817a0a864fe3ada4fb01a344c7e9 ✅
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

#### Step 2: Compile Contracts ✅
```bash
npm run compile
```

#### Step 3: Deploy to Sepolia
```bash
npm run deploy:sepolia
```

#### Step 4: Verify Contracts
```bash
npm run verify:sepolia
```

#### Step 5: Update Frontend Configuration
Update contract addresses in `src/lib/web3.ts`

### 📊 **Expected Deployment Output**
- Contract addresses for both contracts
- Transaction hashes
- Network confirmation
- Verification status

### 🔍 **Post-Deployment Verification**
- [ ] Contracts deployed successfully
- [ ] Contract code verified on Etherscan
- [ ] Frontend updated with new addresses
- [ ] Test event creation on Sepolia
- [ ] Test ticket minting on Sepolia
- [ ] Test P2P resale on Sepolia

### 🎯 **Success Criteria**
- ✅ Both contracts deployed to Sepolia testnet
- ✅ Contracts verified on Etherscan
- ✅ Frontend can interact with deployed contracts
- ✅ End-to-end testing successful on Sepolia

### 🔄 **Why Sepolia Instead of Fuji?**
- **Avalanche Fuji faucet**: Rate limited (1440 minutes wait)
- **Sepolia faucet**: More reliable, faster access
- **Ethereum ecosystem**: Better tooling and verification
- **Gas costs**: Similar to Fuji (very low on testnets)

---

## 📝 **Deployment Log**

*This section will be updated during deployment with actual results.*

### Deployment Results
- **EventFactory**: `Pending...`
- **TicketResale**: `Pending...`
- **Total Gas Used**: `Pending...`
- **Deployment Time**: `Pending...`

### Verification Status
- **EventFactory**: `Pending...`
- **TicketResale**: `Pending...`

### Frontend Integration
- **Status**: `Pending...`
- **Contract Addresses Updated**: `Pending...`
- **Web3 Integration Tested**: `Pending...`

---

*Last Updated: Ready for Sepolia deployment...*
