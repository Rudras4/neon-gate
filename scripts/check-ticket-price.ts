import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Ticket Price from Smart Contract...\n");

  try {
    // Contract addresses
    const eventFactoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);

    // Create EventFactory contract instance
    const eventFactory = await ethers.getContractAt("EventFactory", eventFactoryAddress);
    
    // Get all events from the factory
    console.log("\n📋 Checking events in factory...");
    const allEvents = await eventFactory.getAllEvents();
    console.log("   Total events:", allEvents.length);
    
    if (allEvents.length > 0) {
      const latestEventAddress = allEvents[allEvents.length - 1];
      console.log("   Latest event contract:", latestEventAddress);
      
      // Create EventTicket contract instance
      const eventTicketABI = [
        "function getTier(string memory tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))",
        "function getAllTierNames() external view returns (string[] memory)"
      ];
      
      const eventTicket = await ethers.getContractAt(eventTicketABI, latestEventAddress);
      
      // Get all tier names
      console.log("\n🎫 Checking ticket tiers...");
      const tierNames = await eventTicket.getAllTierNames();
      console.log("   Available tiers:", tierNames);
      
      // Check each tier's price
      for (const tierName of tierNames) {
        try {
          const tierData = await eventTicket.getTier(tierName);
          console.log(`\n   Tier: ${tierName}`);
          console.log(`   Price: ${ethers.formatEther(tierData.price)} ETH`);
          console.log(`   Quantity: ${tierData.quantity}`);
          console.log(`   Minted: ${tierData.minted}`);
        } catch (error) {
          console.log(`   ❌ Error reading tier ${tierName}:`, error.message);
        }
      }
    } else {
      console.log("   No events found in factory");
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
