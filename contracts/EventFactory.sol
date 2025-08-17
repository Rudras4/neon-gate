// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./EventTicket.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating new event collections
 * Each event becomes an NFT collection with N tickets based on occupancy
 */
contract EventFactory is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event EventCreated(
        address indexed eventContract,
        address indexed organizer,
        string eventName,
        uint256 maxOccupancy,
        uint256 creationFee
    );
    
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // State variables
    uint256 public eventCreationFee = 0.01 ether; // 0.01 AVAX/ETH
    mapping(address => address[]) public organizerEvents;
    address[] public allEvents;
    
    // Structs
    struct EventConfig {
        string eventName;
        string eventDescription;
        uint256 maxOccupancy;
        uint256[] tierPrices;
        string[] tierNames;
        uint256 eventDate;
        uint256[] tierQuantities;
    }
    
    // Modifiers
    modifier validEventConfig(EventConfig memory config) {
        require(bytes(config.eventName).length > 0, "Event name cannot be empty");
        require(config.maxOccupancy > 0, "Max occupancy must be greater than 0");
        require(config.tierPrices.length > 0, "Must have at least one tier");
        require(config.tierPrices.length == config.tierNames.length, "Tier arrays length mismatch");
        require(config.tierPrices.length == config.tierQuantities.length, "Tier quantities length mismatch");
        require(config.eventDate > block.timestamp, "Event date must be in the future");
        
        uint256 totalTickets = 0;
        for (uint256 i = 0; i < config.tierQuantities.length; i++) {
            totalTickets += config.tierQuantities[i];
        }
        require(totalTickets <= config.maxOccupancy, "Total tickets exceed max occupancy");
        
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new event collection
     * @param config Event configuration including tiers and pricing
     * @return eventContract Address of the newly created event contract
     */
    function createEvent(EventConfig memory config) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validEventConfig(config)
        returns (address eventContract)
    {
        require(msg.value >= eventCreationFee, "Insufficient creation fee");
        
        // Create new EventTicket contract
        eventContract = address(new EventTicket(
            config.eventName,
            config.eventDescription,
            config.maxOccupancy,
            config.tierPrices,
            config.tierNames,
            config.tierQuantities,
            config.eventDate,
            msg.sender // organizer
        ));
        
        // Store event information
        organizerEvents[msg.sender].push(eventContract);
        allEvents.push(eventContract);
        
        // Note: Initial tickets will be minted by the organizer calling mintInitialTickets directly
        
        emit EventCreated(
            eventContract,
            msg.sender,
            config.eventName,
            config.maxOccupancy,
            eventCreationFee
        );
        
        // Refund excess fee if any
        if (msg.value > eventCreationFee) {
            payable(msg.sender).transfer(msg.value - eventCreationFee);
        }
    }
    
    /**
     * @dev Get all events created by an organizer
     * @param organizer Address of the event organizer
     * @return events Array of event contract addresses
     */
    function getOrganizerEvents(address organizer) external view returns (address[] memory) {
        return organizerEvents[organizer];
    }
    
    /**
     * @dev Get all events created through this factory
     * @return events Array of all event contract addresses
     */
    function getAllEvents() external view returns (address[] memory) {
        return allEvents;
    }
    
    /**
     * @dev Get event creation fee
     * @return fee Current creation fee in wei
     */
    function getEventCreationFee() external view returns (uint256) {
        return eventCreationFee;
    }
    
    /**
     * @dev Update event creation fee (owner only)
     * @param newFee New creation fee in wei
     */
    function updateCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = eventCreationFee;
        eventCreationFee = newFee;
        emit CreationFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw accumulated fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency pause (owner only)
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
}
