import { ethers } from "hardhat";

async function main() {
  console.log("🎫 Testing EventTicket Contract Directly...\n");

  try {
    // EventTicket contract address (the one created by EventFactory)
    const eventTicketAddress = "0x75537828f2ce51be7289709686A69CbFDbB714F1";
    
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);

    // Create EventTicket contract instance
    const eventTicketABI = [
      "function getTier(string memory tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))",
      "function getAllTierNames() external view returns (string[] memory)",
      "function buyTicket(string memory tierName, string memory metadataURI) external payable returns (uint256)"
    ];
    
    const eventTicket = await ethers.getContractAt(eventTicketABI, eventTicketAddress);
    
    // Test getting tier information
    console.log("\n🎫 Testing ticket tiers...");
    const tierNames = await eventTicket.getAllTierNames();
    console.log("   Available tiers:", tierNames);
    
    // Check each tier's details
    for (const tierName of tierNames) {
      try {
        const tierData = await eventTicket.getTier(tierName);
        console.log(`\n   Tier: ${tierName}`);
        console.log(`   Price: ${ethers.formatEther(tierData.price)} ETH`);
        console.log(`   Quantity: ${tierData.quantity}`);
        console.log(`   Minted: ${tierData.minted}`);
        console.log(`   Exists: ${tierData.exists}`);
      } catch (error) {
        console.log(`   ❌ Error reading tier ${tierName}:`, error.message);
      }
    }
    
    // Test buying a ticket
    console.log("\n🚀 Testing ticket purchase...");
    try {
      const tierName = "General";
      const metadataURI = "ipfs://QmTestTicket";
      const price = ethers.parseEther("0.01"); // 0.01 ETH
      
      console.log(`   Buying ${tierName} ticket for ${ethers.formatEther(price)} ETH...`);
      
      const tx = await eventTicket.buyTicket(tierName, metadataURI, { value: price });
      console.log("   Transaction hash:", tx.hash);
      
      console.log("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("✅ Ticket purchased successfully!");
      console.log("   Block number:", receipt.blockNumber);
      console.log("   Gas used:", receipt.gasUsed.toString());
      
    } catch (error) {
      console.log("   ❌ Ticket purchase failed:", error.message);
    }
    
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
