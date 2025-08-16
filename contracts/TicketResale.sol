// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
 * @title TicketResale
 * @dev Smart contract for P2P ticket resale marketplace
 * Integrates with existing P2P resale UI
 */
contract TicketResale is Ownable, ERC721Holder {
    
    // Events
    event TicketListed(
        address indexed eventContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 listingId
    );
    
    event TicketSold(
        address indexed eventContract,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price,
        uint256 listingId
    );
    
    event ListingCancelled(
        address indexed eventContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 listingId
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    // State variables
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public listingFee = 50; // 0.5% (50 basis points)
    uint256 private _listingCounter;
    
    // Structs
    struct ResaleListing {
        uint256 listingId;
        address eventContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 timestamp;
        bool isActive;
        string metadataURI;
    }
    
    // Mappings
    mapping(uint256 => ResaleListing) public listings;
    mapping(address => mapping(uint256 => uint256)) public eventTokenToListingId;
    mapping(address => uint256[]) public userListings;
    
    // Modifiers
    modifier listingExists(uint256 listingId) {
        require(listingId > 0 && listingId <= _listingCounter, "Listing does not exist");
        require(listings[listingId].isActive, "Listing is not active");
        _;
    }
    
    modifier onlyListingOwner(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Only listing owner can perform this action");
        _;
    }
    
    modifier validPrice(uint256 price) {
        require(price > 0, "Price must be greater than 0");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev List a ticket for resale
     * @param eventContract Address of the event contract
     * @param tokenId The token ID to list
     * @param price Resale price
     * @return listingId The ID of the created listing
     */
    function listTicketForResale(
        address eventContract,
        uint256 tokenId,
        uint256 price
    ) external validPrice(price) returns (uint256) {
        require(eventContract != address(0), "Invalid event contract address");
        
        // Check if ticket is already listed
        require(listings[eventTokenToListingId[eventContract][tokenId]].isActive == false, "Ticket already listed");
        
        // Verify ownership and approve transfer
        IERC721 ticketContract = IERC721(eventContract);
        require(ticketContract.ownerOf(tokenId) == msg.sender, "Not the ticket owner");
        
        // Transfer ticket to this contract (escrow)
        ticketContract.safeTransferFrom(msg.sender, address(this), tokenId);
        
        _listingCounter++;
        uint256 listingId = _listingCounter;
        
        listings[listingId] = ResaleListing({
            listingId: listingId,
            eventContract: eventContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            timestamp: block.timestamp,
            isActive: true,
            metadataURI: "" // Metadata URI is not fetched on-chain
        });
        
        eventTokenToListingId[eventContract][tokenId] = listingId;
        
        emit TicketListed(eventContract, tokenId, msg.sender, price, listingId);
        return listingId;
    }
    
    /**
     * @dev Buy a resale ticket
     * @param listingId The listing ID to purchase
     */
    function buyResaleTicket(
        uint256 listingId
    ) external payable listingExists(listingId) {
        ResaleListing storage listing = listings[listingId];
        require(msg.sender != listing.seller, "Cannot buy your own ticket");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Mark listing as inactive
        listing.isActive = false;
        
        // Calculate fees (2.5% transaction fee)
        uint256 transactionFee = (listing.price * 25) / 1000; // 2.5%
        uint256 sellerAmount = listing.price - transactionFee;
        
        // Transfer ticket to buyer
        IERC721 ticketContract = IERC721(listing.eventContract);
        ticketContract.safeTransferFrom(address(this), msg.sender, listing.tokenId);
        
        // Transfer funds
        payable(listing.seller).transfer(sellerAmount);
        payable(owner()).transfer(transactionFee);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit TicketSold(
            listing.eventContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price,
            listingId
        );
    }
    
    /**
     * @dev Cancel a resale listing
     * @param listingId The listing ID to cancel
     */
    function cancelResaleListing(uint256 listingId)
        external
        listingExists(listingId)
        onlyListingOwner(listingId)
    {
        ResaleListing storage listing = listings[listingId];
        listing.isActive = false;
        
        // Return ticket to seller
        IERC721 ticketContract = IERC721(listing.eventContract);
        ticketContract.safeTransferFrom(address(this), listing.seller, listing.tokenId);
        
        emit ListingCancelled(listing.eventContract, listing.tokenId, listing.seller, listingId);
    }
    
    /**
     * @dev Get all active resale listings for an event
     * @param eventContract Address of the event contract
     * @return activeListings Array of active listing IDs
     */
    function getResaleListings(address eventContract) external view returns (uint256[] memory) {
        uint256[] memory tempListings = new uint256[](_listingCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _listingCounter; i++) {
            if (listings[i].eventContract == eventContract && listings[i].isActive) {
                tempListings[count] = i;
                count++;
            }
        }
        
        uint256[] memory activeListings = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            activeListings[i] = tempListings[i];
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listing details by ID
     * @param listingId The listing ID
     * @return listing The listing details
     */
    function getListing(uint256 listingId) external view returns (ResaleListing memory) {
        require(listingId > 0 && listingId <= _listingCounter, "Listing does not exist");
        return listings[listingId];
    }
    
    /**
     * @dev Check if ticket is listed for resale
     * @param eventContract Address of the event contract
     * @param tokenId Token ID of the ticket
     * @return isListed True if ticket is listed
     */
    function isTicketListed(address eventContract, uint256 tokenId) external view returns (bool) {
        uint256 listingId = eventTokenToListingId[eventContract][tokenId];
        return listingId > 0 && listings[listingId].isActive;
    }
    
    /**
     * @dev Get total listings count
     * @return totalListings Total number of listings created
     */
    function getTotalListings() external view returns (uint256) {
        return _listingCounter;
    }
    
    /**
     * @dev Update platform fee (owner only)
     * @param newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update listing fee (owner only)
     * @param newFee New listing fee in basis points
     */
    function updateListingFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee cannot exceed 5%");
        uint256 oldFee = listingFee;
        listingFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency function to return stuck tickets (owner only)
     * @param eventContract Address of the event contract
     * @param tokenId The token ID
     * @param to Address to send the ticket to
     */
    function emergencyReturnTicket(
        address eventContract,
        uint256 tokenId,
        address to
    ) external onlyOwner {
        IERC721 ticketContract = IERC721(eventContract);
        require(ticketContract.ownerOf(tokenId) == address(this), "Ticket not in contract");
        
        ticketContract.safeTransferFrom(address(this), to, tokenId);
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
     * @dev Get contract balance
     * @return balance Current contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
