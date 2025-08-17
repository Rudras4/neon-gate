import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing EventFactory Contract Connection...\n");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network Info:");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Network Name:", network.name || "Unknown");
    console.log("");

    // Contract addresses
    const eventFactoryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const ticketResaleAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    console.log("📋 Contract Addresses:");
    console.log("   EventFactory:", eventFactoryAddress);
    console.log("   TicketResale:", ticketResaleAddress);
    console.log("");

    // Test EventFactory contract
    console.log("🧪 Testing EventFactory Contract...");
    const eventFactory = await ethers.getContractAt("EventFactory", eventFactoryAddress);
    
    try {
      // Test getEventCreationFee
      const creationFee = await eventFactory.getEventCreationFee();
      console.log("   ✅ getEventCreationFee():", ethers.formatEther(creationFee), "ETH");
    } catch (error) {
      console.log("   ❌ getEventCreationFee() failed:", error.message);
    }

    try {
      // Test eventCreationFee (public variable)
      const creationFeeVar = await eventFactory.eventCreationFee();
      console.log("   ✅ eventCreationFee (variable):", ethers.formatEther(creationFeeVar), "ETH");
    } catch (error) {
      console.log("   ❌ eventCreationFee (variable) failed:", error.message);
    }

    try {
      // Test getAllEvents
      const allEvents = await eventFactory.getAllEvents();
      console.log("   ✅ getAllEvents():", allEvents.length, "events");
    } catch (error) {
      console.log("   ❌ getAllEvents() failed:", error.message);
    }

    console.log("");

    // Test TicketResale contract
    console.log("🧪 Testing TicketResale Contract...");
    const ticketResale = await ethers.getContractAt("TicketResale", ticketResaleAddress);
    
    try {
      const platformFee = await ticketResale.platformFee();
      console.log("   ✅ platformFee():", platformFee.toString(), "basis points");
    } catch (error) {
      console.log("   ❌ platformFee() failed:", error.message);
    }

    console.log("\n🎯 Contract Connection Test Complete!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
