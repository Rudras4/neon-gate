# MetaMask Localhost Setup Guide

## Step 1: Start Your Local Hardhat Network

First, make sure your local Hardhat network is running:

```bash
cd neon-gate
npm run node
# or
npx hardhat node
```

This will start a local blockchain on `http://127.0.0.1:8546` with chainId `31337`.

## Step 2: Add Localhost Network to MetaMask

### Option A: Use the "Add Localhost" Button (Recommended)
1. Open your dApp in the browser
2. Click "Connect MetaMask" 
3. Once connected, click the "Add Localhost" button in the network selection
4. Approve the network addition in MetaMask

### Option B: Manual Addition
1. Open MetaMask
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network"
4. Click "Add Network Manually"
5. Fill in the following details:
   - **Network Name**: `Hardhat Localhost`
   - **New RPC URL**: `http://127.0.0.1:8546`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (leave blank)
6. Click "Save"

## Step 3: Import Your Hardhat Account

1. In MetaMask, click on your account icon
2. Click "Import Account"
3. Use the private key from your Hardhat output:
   ```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. This will give you access to the account with 10,000 ETH for testing

## Step 4: Verify Setup

1. Make sure MetaMask shows "Hardhat Localhost" as the selected network
2. Your account should show a balance of 10,000 ETH
3. The network should show chainId 31337

## Troubleshooting

### "MetaMask is not installed" Error
- Make sure MetaMask extension is installed and enabled
- Try refreshing the page
- Check if MetaMask is unlocked

### Network Connection Issues
- Ensure Hardhat node is running on port 8546
- Check if the port is not blocked by firewall
- Try switching to a different network and back

### Account Import Issues
- Make sure you're copying the full private key (including 0x prefix)
- Verify the Hardhat node is running and showing the account details

## Network Details

- **Network Name**: Hardhat Localhost
- **RPC URL**: http://127.0.0.1:8546
- **Chain ID**: 31337 (0x7a69 in hex)
- **Currency**: ETH
- **Block Explorer**: None (local network)

## Development Workflow

1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy:localhost`
3. Import account to MetaMask
4. Test your dApp functionality
5. Use the 10,000 ETH for gas fees and transactions
