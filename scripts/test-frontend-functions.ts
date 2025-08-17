import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing Frontend Functions...\n");

  // Use the current deployed contract addresses
  const eventFactoryAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
  const ticketResaleAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const eventTicketAddress = '0x61c36a8d610163660E21a8b7359e1Cac0C9133e1';

  console.log("📍 Contract Addresses:");
  console.log(`   EventFactory: ${eventFactoryAddress}`);
  console.log(`   TicketResale: ${ticketResaleAddress}`);
  console.log(`   EventTicket: ${eventTicketAddress}\n`);

  // Get signers
  const [organizer, user1, user2] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`   Organizer: ${organizer.address}`);
  console.log(`   User 1: ${user1.address}`);
  console.log(`   User 2: ${user2.address}\n`);

  // Test EventTicket contract functions
  console.log("🎫 Testing EventTicket Contract Functions...");
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = EventTicket.attach(eventTicketAddress);

  try {
    // Test getTier function
    console.log("💰 Testing getTier('General')...");
    const generalTier = await eventTicket.getTier("General");
    console.log("   ✅ General tier data:", {
      name: generalTier.name,
      price: ethers.formatEther(generalTier.price),
      quantity: generalTier.quantity.toString(),
      minted: generalTier.minted.toString(),
      exists: generalTier.exists
    });

    console.log("💰 Testing getTier('VIP')...");
    const vipTier = await eventTicket.getTier("VIP");
    console.log("   ✅ VIP tier data:", {
      name: vipTier.name,
      price: ethers.formatEther(vipTier.price),
      quantity: vipTier.quantity.toString(),
      minted: vipTier.minted.toString(),
      exists: vipTier.exists
    });

    // Test getAllTierNames
    console.log("📋 Testing getAllTierNames()...");
    const tierNames = await eventTicket.getAllTierNames();
    console.log("   ✅ Available tiers:", tierNames);

    // Test getAvailableSeats
    console.log("🪑 Testing getAvailableSeats()...");
    const availableSeats = await eventTicket.getAvailableSeats();
    console.log("   ✅ Available seats:", availableSeats.toString());

    // Test getTotalMinted
    console.log("🎫 Testing getTotalMinted()...");
    const totalMinted = await eventTicket.getTotalMinted();
    console.log("   ✅ Total tickets minted:", totalMinted.toString());

    // Test buyTicket function (this should work now)
    console.log("🛒 Testing buyTicket function...");
    const metadataURI = `ipfs://QmTestTicket_${Date.now()}`;
    
    console.log("   📝 Attempting to buy a General ticket...");
    const buyTx = await eventTicket.connect(user1).buyTicket(
      "General",
      metadataURI,
      { value: ethers.parseEther("0.01") }
    );
    
    console.log("   ⏳ Waiting for transaction...");
    const receipt = await buyTx.wait();
    console.log("   ✅ Ticket purchased successfully!");
    console.log("   🎫 Transaction hash:", receipt?.hash);
    
    // Get the new ticket details
    const newTicketId = totalMinted.toNumber() + 1;
    const newTicket = await eventTicket.getTicket(newTicketId);
    console.log("   📋 New ticket details:", {
      tokenId: newTicket.tokenId.toString(),
      seatNumber: newTicket.seatNumber.toString(),
      tier: newTicket.tier,
      owner: newTicket.owner
    });

  } catch (error) {
    console.error("❌ Error testing EventTicket functions:", error);
  }

  console.log("\n🎉 Frontend Function Test Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
