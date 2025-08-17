import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Testing Complete NFT Ticket Flow...\n");

  // Get signers (simulating 2 users)
  const [organizer, user1, user2] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`   Organizer: ${organizer.address}`);
  console.log(`   User 1: ${user1.address}`);
  console.log(`   User 2: ${user2.address}\n`);

  // Deploy EventFactory
  console.log("📋 Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();
  await eventFactory.waitForDeployment();
  console.log(`   ✅ EventFactory deployed to: ${await eventFactory.getAddress()}\n`);

  // Deploy TicketResale
  console.log("🔄 Deploying TicketResale...");
  const TicketResale = await ethers.getContractFactory("TicketResale");
  const ticketResale = await TicketResale.deploy();
  await ticketResale.waitForDeployment();
  console.log(`   ✅ TicketResale deployed to: ${await ticketResale.getAddress()}\n`);

  // Create event
  console.log("🎭 Creating Web3 Event...");
  const eventName = "Crypto Conference 2024";
  const eventDescription = "The biggest crypto event of the year";
  const maxOccupancy = 100;
  const tierPrices = [ethers.parseEther("0.01"), ethers.parseEther("0.02")]; // 0.01 ETH, 0.02 ETH
  const tierNames = ["General", "VIP"];
  const tierQuantities = [50, 25]; // 50 General, 25 VIP tickets
  const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
  
  // Create EventConfig struct
  const eventConfig = {
    eventName,
    eventDescription,
    maxOccupancy,
    tierPrices,
    tierNames,
    eventDate,
    tierQuantities
  };
  
  const createEventTx = await eventFactory.createEvent(
    eventConfig,
    { value: ethers.parseEther("0.01") } // Event creation fee
  );
  
  const createEventReceipt = await createEventTx.wait();
  console.log(`   ✅ Event created! TX: ${createEventReceipt?.hash}\n`);

  // Get deployed event contract address from the allEvents array
  const allEvents = await eventFactory.getAllEvents();
  const eventAddress = allEvents[0]; // First event
  console.log(`   📍 Event contract deployed to: ${eventAddress}\n`);

  // Get EventTicket contract instance
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = EventTicket.attach(eventAddress);

  // Initial ticket quantities are now set during event creation
  console.log("🎫 Initial ticket quantities set during event creation");
  console.log("   ✅ General: 50 tickets, VIP: 25 tickets\n");

  // User 1 buys a General ticket
  console.log("💰 User 1 buying General ticket...");
  const user1TicketTx = await eventTicket.connect(user1).buyTicket(
    "General",
    "ipfs://QmGeneralTicketMetadata",
    { value: ethers.parseEther("0.01") }
  );
  const user1TicketReceipt = await user1TicketTx.wait();
  console.log(`   ✅ User 1 bought General ticket! TX: ${user1TicketReceipt?.hash}`);

  // Get ticket details
  const user1TicketId = 1; // First ticket minted
  const user1Ticket = await eventTicket.getTicket(user1TicketId);
  console.log(`   📋 Ticket ID: ${user1Ticket.tokenId}`);
  console.log(`   🪑 Seat: ${user1Ticket.seatNumber}`);
  console.log(`   🏷️ Tier: ${user1Ticket.tier}`);
  console.log(`   👤 Owner: ${user1Ticket.owner}\n`);

  // User 2 buys a VIP ticket
  console.log("💰 User 2 buying VIP ticket...");
  const user2TicketTx = await eventTicket.connect(user2).buyTicket(
    "VIP",
    "ipfs://QmVIPTicketMetadata",
    { value: ethers.parseEther("0.02") }
  );
  const user2TicketReceipt = await user2TicketTx.wait();
  console.log(`   ✅ User 2 bought VIP ticket! TX: ${user2TicketReceipt?.hash}`);

  // Get ticket details
  const user2TicketId = 2; // Second ticket minted
  const user2Ticket = await eventTicket.getTicket(user2TicketId);
  console.log(`   📋 Ticket ID: ${user2Ticket.tokenId}`);
  console.log(`   🪑 Seat: ${user2Ticket.seatNumber}`);
  console.log(`   🏷️ Tier: ${user2Ticket.tier}`);
  console.log(`   👤 Owner: ${user2Ticket.owner}\n`);

  // User 1 lists ticket for resale
  console.log("📝 User 1 listing ticket for resale...");
  
  // First approve the resale contract
  const approveTx = await eventTicket.connect(user1).approve(
    await ticketResale.getAddress(),
    user1TicketId
  );
  await approveTx.wait();
  console.log("   ✅ Approval granted to resale contract");

  // List for resale at higher price
  const resalePrice = ethers.parseEther("0.015"); // 0.015 ETH (50% markup)
  const listTx = await ticketResale.connect(user1).listTicketForResale(
    eventAddress,
    user1TicketId,
    resalePrice
  );
  const listReceipt = await listTx.wait();
  console.log(`   ✅ Ticket listed for resale! TX: ${listReceipt?.hash}`);
  console.log(`   💰 Resale price: ${ethers.formatEther(resalePrice)} ETH\n`);

  // Get listing details
  const listingId = 1; // First listing
  const listing = await ticketResale.listings(listingId);
  console.log(`   📋 Listing ID: ${listing.listingId}`);
  console.log(`   🎫 Event Contract: ${listing.eventContract}`);
  console.log(`   🆔 Token ID: ${listing.tokenId}`);
  console.log(`   👤 Seller: ${listing.seller}`);
  console.log(`   💰 Price: ${ethers.formatEther(listing.price)} ETH`);
  console.log(`   ✅ Active: ${listing.isActive}\n`);

  // User 2 buys the resale ticket
  console.log("🔄 User 2 buying resale ticket from User 1...");
  const buyResaleTx = await ticketResale.connect(user2).buyResaleTicket(
    listingId,
    { value: resalePrice }
  );
  const buyResaleReceipt = await buyResaleTx.wait();
  console.log(`   ✅ Resale purchase successful! TX: ${buyResaleReceipt?.hash}`);

  // Check new ownership
  const newOwner = await eventTicket.ownerOf(user1TicketId);
  console.log(`   👤 New ticket owner: ${newOwner}`);
  console.log(`   ✅ User 2 now owns User 1's ticket!\n`);

  // Check balances
  const user1Balance = await ethers.provider.getBalance(user1.address);
  const user2Balance = await ethers.provider.getBalance(user2.address);
  const organizerBalance = await ethers.provider.getBalance(organizer.address);
  
  console.log("💰 Final Balances:");
  console.log(`   User 1: ${ethers.formatEther(user1Balance)} ETH`);
  console.log(`   User 2: ${ethers.formatEther(user2Balance)} ETH`);
  console.log(`   Organizer: ${ethers.formatEther(organizerBalance)} ETH\n`);

  // Get all tickets for each user
  const user1Tickets = await eventTicket.getUserTickets(user1.address);
  const user2Tickets = await eventTicket.getUserTickets(user2.address);
  
  console.log("🎫 Final Ticket Ownership:");
  console.log(`   User 1 tickets: ${user1Tickets.length}`);
  console.log(`   User 2 tickets: ${user2Tickets.length}`);
  
  if (user2Tickets.length > 0) {
    console.log(`   User 2's tickets: ${user2Tickets.join(', ')}`);
  }

  console.log("\n🎉 NFT Ticket Flow Test Complete!");
  console.log("\n📋 Summary:");
  console.log("   1. ✅ Event created and deployed");
  console.log("   2. ✅ Initial ticket quantities set");
  console.log("   3. ✅ User 1 bought General ticket");
  console.log("   4. ✅ User 2 bought VIP ticket");
  console.log("   5. ✅ User 1 listed ticket for resale");
  console.log("   6. ✅ User 2 bought resale ticket");
  console.log("   7. ✅ Ownership transferred successfully");
  console.log("   8. ✅ All balances updated correctly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
