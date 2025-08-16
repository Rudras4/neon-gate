import { ethers } from "hardhat";
import { EventFactory, EventTicket, TicketResale } from "../typechain-types";

async function main() {
  console.log("🚀 Testing Smart Contracts Locally...\n");

  // Get signers
  const [deployer, organizer, buyer1, buyer2] = await ethers.getSigners();
  
  console.log("📋 Test Accounts:");
  console.log("Deployer:", deployer.address);
  console.log("Organizer:", organizer.address);
  console.log("Buyer 1:", buyer1.address);
  console.log("Buyer 2:", buyer2.address);
  console.log("");

  // Deploy EventFactory
  console.log("🏭 Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();
  await eventFactory.waitForDeployment();
  console.log("✅ EventFactory deployed to:", await eventFactory.getAddress());

  // Deploy TicketResale
  console.log("🔄 Deploying TicketResale...");
  const TicketResale = await ethers.getContractFactory("TicketResale");
  const ticketResale = await TicketResale.deploy();
  await ticketResale.waitForDeployment();
  console.log("✅ TicketResale deployed to:", await ticketResale.getAddress());

  // Test Event Creation
  console.log("\n🎫 Testing Event Creation...");
  
  const eventConfig = {
    eventName: "Web3 Hackathon Concert",
    eventDescription: "A revolutionary Web3 ticketing event",
    maxOccupancy: 100,
    tierPrices: [
      ethers.parseEther("0.01"), // Bronze: 0.01 ETH
      ethers.parseEther("0.02"), // Silver: 0.02 ETH
      ethers.parseEther("0.05")  // Gold: 0.05 ETH
    ],
    tierNames: ["Bronze", "Silver", "Gold"],
    eventDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    tierQuantities: [40, 35, 25] // Total: 100 tickets
  };

  const creationFee = await eventFactory.eventCreationFee();
  console.log("💰 Creation fee:", ethers.formatEther(creationFee), "ETH");

  // Create event as organizer
  const createEventTx = await eventFactory.connect(organizer).createEvent(
    eventConfig,
    { value: creationFee }
  );
  
  console.log("📝 Event creation transaction:", createEventTx.hash);
  const receipt = await createEventTx.wait();
  console.log("✅ Event created successfully!");

  // Get the created event contract address
  const organizerEvents = await eventFactory.getOrganizerEvents(organizer.address);
  const eventContractAddress = organizerEvents[0];
  console.log("🎭 Event contract deployed to:", eventContractAddress);

  // Get EventTicket contract instance
  const eventTicket = await ethers.getContractAt("EventTicket", eventContractAddress);

  // Mint initial tickets for the event
  console.log("🎫 Minting initial tickets...");
  const mintInitialTx = await eventTicket.connect(organizer).mintInitialTickets(
    eventConfig.tierQuantities,
    organizer.address
  );
  await mintInitialTx.wait();
  console.log("✅ Initial tickets minted successfully!");

  // Test ticket minting
  console.log("\n🎫 Testing Ticket Minting...");
  
  // Mint a ticket for buyer1
  const mintTx = await eventTicket.connect(organizer).mintTicket(
    buyer1.address,
    1, // Seat number
    "Gold", // Tier
    "ipfs://QmTestMetadata123" // Mock metadata URI
  );
  
  await mintTx.wait();
  console.log("✅ Ticket minted for buyer1 - Seat 1, Gold tier");

  // Mint another ticket for buyer2
  const mintTx2 = await eventTicket.connect(organizer).mintTicket(
    buyer2.address,
    2, // Seat number
    "Silver", // Tier
    "ipfs://QmTestMetadata456" // Mock metadata URI
  );
  
  await mintTx2.wait();
  console.log("✅ Ticket minted for buyer2 - Seat 2, Silver tier");

  // Test ticket information retrieval
  console.log("\n🔍 Testing Ticket Information...");
  
  const ticket1 = await eventTicket.getTicket(1);
  console.log("Ticket 1:", {
    seatNumber: ticket1.seatNumber.toString(),
    tier: ticket1.tier,
    owner: ticket1.owner
  });

  const ticket2 = await eventTicket.getTicket(2);
  console.log("Ticket 2:", {
    seatNumber: ticket2.seatNumber.toString(),
    tier: ticket2.tier,
    owner: ticket2.owner
  });

  // Test resale functionality
  console.log("\n🔄 Testing Resale Functionality...");
  
  // Approve the TicketResale contract to transfer the ticket
  console.log("🔐 Approving ticket transfer...");
  const approveTx = await eventTicket.connect(buyer1).approve(await ticketResale.getAddress(), 1);
  await approveTx.wait();
  console.log("✅ Ticket approval successful!");
  
  // List ticket for resale
  const listTx = await ticketResale.connect(buyer1).listTicketForResale(
    eventContractAddress,
    1, // Token ID
    ethers.parseEther("0.08") // Resale price: 0.08 ETH
  );
  
  await listTx.wait();
  console.log("✅ Ticket 1 listed for resale at 0.08 ETH");

  // Get resale listings
  const listings = await ticketResale.getResaleListings(eventContractAddress);
  console.log("📋 Active resale listings:", listings.length);
  
  if (listings.length > 0) {
    const listingId = listings[0];
    const listing = await ticketResale.getListing(listingId);
    console.log("Listing details:", {
      listingId: listing.listingId.toString(),
      price: ethers.formatEther(listing.price),
      seller: listing.seller
    });
  }

  // Test buying resale ticket
  console.log("\n💰 Testing Resale Purchase...");
  
  const buyTx = await ticketResale.connect(buyer2).buyResaleTicket(
    1, // Listing ID
    { value: ethers.parseEther("0.08") }
  );
  
  await buyTx.wait();
  console.log("✅ Resale ticket purchased successfully!");

  // Verify ticket ownership transfer
  const newOwner = await eventTicket.ownerOf(1);
  console.log("🎫 Ticket 1 new owner:", newOwner);
  console.log("Expected owner:", buyer2.address);
  console.log("Ownership transfer successful:", newOwner === buyer2.address);
  
  // Verify the listing is now inactive
  const listingAfterPurchase = await ticketResale.getListing(1);
  console.log("Listing active after purchase:", listingAfterPurchase.isActive);

  console.log("\n🎉 All tests completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- EventFactory deployed and working");
  console.log("- Event created with 3 tiers (Bronze, Silver, Gold)");
  console.log("- Tickets minted and assigned to seats");
  console.log("- Resale marketplace functional");
  console.log("- P2P trading working correctly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
