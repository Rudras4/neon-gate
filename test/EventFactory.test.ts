import { expect } from "chai";
import { ethers } from "hardhat";
import { EventFactory, EventTicket } from "../typechain-types";
import { SignerWithAddress } from "@ethersproject/contracts";

describe("EventFactory", function () {
  let eventFactory: EventFactory;
  let owner: SignerWithAddress;
  let organizer: SignerWithAddress;
  let user: SignerWithAddress;
  
  const eventName = "Test Concert";
  const eventDescription = "A test concert event";
  const maxOccupancy = 100;
  const tierPrices = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2")];
  const tierNames = ["Bronze", "Silver"];
  const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
  const tierQuantities = [50, 50];
  
  beforeEach(async function () {
    [owner, organizer, user] = await ethers.getSigners();
    
    const EventFactory = await ethers.getContractFactory("EventFactory");
    eventFactory = await EventFactory.deploy();
    await eventFactory.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await eventFactory.owner()).to.equal(owner.address);
    });
    
    it("Should have correct creation fee", async function () {
      expect(await eventFactory.eventCreationFee()).to.equal(ethers.utils.parseEther("0.01"));
    });
  });
  
  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const creationFee = await eventFactory.eventCreationFee();
      
      await expect(
        eventFactory.connect(organizer).createEvent(
          {
            eventName,
            eventDescription,
            maxOccupancy,
            tierPrices,
            tierNames,
            eventDate,
            tierQuantities
          },
          { value: creationFee }
        )
      ).to.emit(eventFactory, "EventCreated");
      
      const organizerEvents = await eventFactory.getOrganizerEvents(organizer.address);
      expect(organizerEvents.length).to.equal(1);
      
      const allEvents = await eventFactory.getAllEvents();
      expect(allEvents.length).to.equal(1);
    });
    
    it("Should fail with insufficient creation fee", async function () {
      const insufficientFee = ethers.utils.parseEther("0.005");
      
      await expect(
        eventFactory.connect(organizer).createEvent(
          {
            eventName,
            eventDescription,
            maxOccupancy,
            tierPrices,
            tierNames,
            eventDate,
            tierQuantities
          },
          { value: insufficientFee }
        )
      ).to.be.revertedWith("Insufficient creation fee");
    });
    
    it("Should fail with invalid event configuration", async function () {
      const creationFee = await eventFactory.eventCreationFee();
      const invalidTierQuantities = [60, 50]; // Exceeds maxOccupancy
      
      await expect(
        eventFactory.connect(organizer).createEvent(
          {
            eventName,
            eventDescription,
            maxOccupancy,
            tierPrices,
            tierNames,
            eventDate,
            invalidTierQuantities
          },
          { value: creationFee }
        )
      ).to.be.revertedWith("Total tickets exceed max occupancy");
    });
  });
  
  describe("Access Control", function () {
    it("Should allow owner to update creation fee", async function () {
      const newFee = ethers.utils.parseEther("0.02");
      
      await expect(eventFactory.updateCreationFee(newFee))
        .to.emit(eventFactory, "CreationFeeUpdated");
      
      expect(await eventFactory.eventCreationFee()).to.equal(newFee);
    });
    
    it("Should not allow non-owner to update creation fee", async function () {
      const newFee = ethers.utils.parseEther("0.02");
      
      await expect(
        eventFactory.connect(organizer).updateCreationFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should allow owner to pause contract", async function () {
      await eventFactory.pause();
      expect(await eventFactory.paused()).to.be.true;
    });
    
    it("Should not allow non-owner to pause contract", async function () {
      await expect(
        eventFactory.connect(organizer).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Fee Management", function () {
    it("Should allow owner to withdraw fees", async function () {
      const creationFee = await eventFactory.eventCreationFee();
      
      // Create an event to generate fees
      await eventFactory.connect(organizer).createEvent(
        {
          eventName,
          eventDescription,
          maxOccupancy,
          tierPrices,
          tierNames,
          eventDate,
          tierQuantities
        },
        { value: creationFee }
      );
      
      const initialBalance = await owner.getBalance();
      await eventFactory.withdrawFees();
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance.gt(initialBalance)).to.be.true;
    });
  });
});
