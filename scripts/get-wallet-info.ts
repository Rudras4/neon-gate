import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Getting Wallet Information and Network Status...\n");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Deployer Account:");
    console.log("   Address:", deployer.address);
    
    // Note: Private key is not directly accessible from HardhatEthersSigner
    console.log("   Private Key: Use the hardcoded key below");
    
    console.log("   Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network Info:");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Network Name:", network.name || "Unknown");
    
    // Get latest block
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("   Latest Block:", latestBlock);
    
    if (latestBlock === 0) {
      console.log("   ⚠️  Warning: No blocks mined yet. Start mining with transactions!");
    }

    console.log("\n📋 Contract Addresses:");
    console.log("   EventFactory: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    console.log("   TicketResale: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

    console.log("\n🚀 To mint tickets:");
    console.log("   1. Connect MetaMask to Localhost 8545 (Chain ID: 31337)");
    console.log("   2. Import account with private key from hardhat config");
    console.log("   3. Go to your event page and click 'Buy Tickets'");
    
    // Show the hardcoded private key from hardhat config
    console.log("\n🔑 Hardhat Default Private Key:");
    console.log("   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
