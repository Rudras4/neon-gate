// Debug script to check blockchain connection and contract issues
// Run this with: node debug-blockchain.js

const { ethers } = require('hardhat');

async function debugBlockchain() {
  console.log('🔍 Debugging Blockchain Connection...\n');
  
  try {
    // Check if we can connect to the network
    console.log('📡 Step 1: Checking network connection...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    try {
      const network = await provider.getNetwork();
      console.log('✅ Network connected:', {
        name: network.name,
        chainId: network.chainId.toString(),
        url: 'http://127.0.0.1:8545'
      });
    } catch (error) {
      console.log('❌ Network connection failed:', error.message);
      console.log('💡 Make sure Hardhat is running with: npx hardhat node');
      return;
    }
    
    // Check if we can get accounts
    console.log('\n👛 Step 2: Checking accounts...');
    try {
      const accounts = await provider.listAccounts();
      console.log('✅ Found accounts:', accounts.length);
      accounts.forEach((account, index) => {
        console.log(`  ${index}: ${account}`);
      });
      
      // Check first account balance
      const balance = await provider.getBalance(accounts[0]);
      console.log(`💰 Account 0 balance: ${ethers.formatEther(balance)} ETH`);
      
    } catch (error) {
      console.log('❌ Failed to get accounts:', error.message);
      return;
    }
    
    // Check if EventFactory contract exists
    console.log('\n🏭 Step 3: Checking EventFactory contract...');
    try {
      const eventFactoryAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
      const code = await provider.getCode(eventFactoryAddress);
      
      if (code === '0x') {
        console.log('❌ EventFactory contract not found at:', eventFactoryAddress);
        console.log('💡 You need to deploy contracts first with: npx hardhat run scripts/deploy.js --network localhost');
      } else {
        console.log('✅ EventFactory contract found at:', eventFactoryAddress);
        console.log('📝 Contract bytecode length:', code.length - 2, 'bytes');
      }
      
    } catch (error) {
      console.log('❌ Failed to check EventFactory:', error.message);
    }
    
    // Check gas estimation
    console.log('\n⛽ Step 4: Checking gas estimation...');
    try {
      const gasPrice = await provider.getFeeData();
      console.log('✅ Gas price:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'gwei');
      
      // Try to estimate gas for a simple transaction
      const tx = {
        to: accounts[0],
        value: ethers.parseEther('0.001')
      };
      
      const estimatedGas = await provider.estimateGas(tx);
      console.log('✅ Gas estimation working, estimated gas for simple tx:', estimatedGas.toString());
      
    } catch (error) {
      console.log('❌ Gas estimation failed:', error.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('• If you see "EventFactory contract not found", run: npx hardhat run scripts/deploy.js --network localhost');
    console.log('• If network connection fails, make sure Hardhat is running: npx hardhat node');
    console.log('• If accounts fail, check your Hardhat configuration');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugBlockchain();
