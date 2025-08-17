import { ethers } from "hardhat";

async function main() {
  console.log("🎭 Creating Test Event Through Smart Contract...\n");

  try {
    // Contract addresses
    const eventFactoryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Create EventFactory contract instance
    const eventFactory = await ethers.getContractAt("EventFactory", eventFactoryAddress);
    
    // Get creation fee
    console.log("💰 Getting event creation fee...");
    const creationFee = await eventFactory.getEventCreationFee();
    console.log("   Creation fee:", ethers.formatEther(creationFee), "ETH");
    
    // Event configuration
    const eventConfig = {
      eventName: "BITCOIN 2025",
      eventDescription: "This is a test event created through smart contract",
      maxOccupancy: 100,
      tierPrices: [
        ethers.parseEther("0.01"),   // General: 0.01 ETH
        ethers.parseEther("0.02"),   // VIP: 0.02 ETH
        ethers.parseEther("0.05")    // Platinum: 0.05 ETH
      ],
      tierNames: ["General", "VIP", "Platinum"],
      eventDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      tierQuantities: [50, 30, 20] // 50 General, 30 VIP, 20 Platinum
    };
    
    console.log("\n📝 Creating event with config:");
    console.log("   Event Name:", eventConfig.eventName);
    console.log("   Tiers:", eventConfig.tierNames.join(", "));
    console.log("   Prices:", eventConfig.tierPrices.map(p => ethers.formatEther(p) + " ETH").join(", "));
    console.log("   Quantities:", eventConfig.tierQuantities.join(", "));
    
    // Create the event
    console.log("\n🚀 Creating event...");
    const tx = await eventFactory.createEvent(eventConfig, { value: creationFee });
    console.log("   Transaction hash:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Event created successfully!");
    console.log("   Block number:", receipt.blockNumber);
    
    // Get the event contract address from the transaction
    console.log("\n🔍 Getting event contract address...");
    const allEvents = await eventFactory.getAllEvents();
    const eventContractAddress = allEvents[allEvents.length - 1];
    console.log("   Event contract address:", eventContractAddress);
    
    // Verify the event was created
    console.log("\n🎫 Verifying event details...");
    const eventTicketABI = [
      "function getTier(string memory tierName) external view returns (tuple(string name, uint256 price, uint256 quantity, uint256 minted, bool exists))",
      "function getAllTierNames() external view returns (string[] memory)"
    ];
    
    const eventTicket = await ethers.getContractAt(eventTicketABI, eventContractAddress);
    const tierNames = await eventTicket.getAllTierNames();
    
    console.log("   Available tiers:", tierNames);
    for (const tierName of tierNames) {
      const tierData = await eventTicket.getTier(tierName);
      console.log(`   ${tierName}: ${ethers.formatEther(tierData.price)} ETH (${tierData.quantity} available)`);
    }
    
    console.log("\n🎉 Test event created successfully!");
    console.log("   You can now test ticket purchases with real prices!");
    
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
