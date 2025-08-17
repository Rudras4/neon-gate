// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventTicket
 * @dev ERC-721 contract for event tickets with seat mapping
 * Each ticket represents one seat (1-N occupancy)
 */
contract EventTicket is ERC721, Ownable {
    
    // Events
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 seatNumber,
        string tier,
        string metadataURI
    );
    
    event TicketPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        string tier,
        uint256 price,
        uint256 seatNumber
    );
    
    event TierAdded(
        string tierName,
        uint256 tierPrice,
        uint256 tierQuantity
    );
    
    // State variables
    string public eventName;
    string public eventDescription;
    uint256 public maxOccupancy;
    uint256 public eventDate;
    address public eventOrganizer;
    
    uint256 private _tokenIdCounter;
    
    // Mappings for metadata
    mapping(uint256 => string) private _tokenURIs;
    
    // Structs
    struct Tier {
        string name;
        uint256 price;
        uint256 quantity;
        uint256 minted;
        bool exists;
    }
    
    struct Ticket {
        uint256 tokenId;
        uint256 seatNumber;
        string tier;
        string metadataURI;
        address owner;
        bool exists;
    }
    
    // Mappings
    mapping(string => Tier) public tiers;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => uint256) public tokenIdToSeatNumber;
    mapping(uint256 => string) public tokenIdToTier;
    mapping(uint256 => bool) public seatOccupied;
    mapping(address => uint256[]) public userTickets;
    
    string[] public tierNames;
    
    // Modifiers
    modifier onlyEventOrganizer() {
        require(msg.sender == eventOrganizer, "Only event organizer can call this function");
        _;
    }
    

    
    modifier validSeatNumber(uint256 seatNumber) {
        require(seatNumber > 0 && seatNumber <= maxOccupancy, "Invalid seat number");
        require(!seatOccupied[seatNumber], "Seat already occupied");
        _;
    }
    
    modifier validTier(string memory tierName) {
        require(tiers[tierName].exists, "Tier does not exist");
        require(tiers[tierName].minted < tiers[tierName].quantity, "Tier sold out");
        _;
    }
    
    modifier validPurchase(string memory tierName) {
        require(tiers[tierName].exists, "Tier does not exist");
        require(tiers[tierName].minted < tiers[tierName].quantity, "Tier sold out");
        require(msg.value >= tiers[tierName].price, "Insufficient payment");
        _;
    }
    
    constructor(
        string memory _eventName,
        string memory _eventDescription,
        uint256 _maxOccupancy,
        uint256[] memory _tierPrices,
        string[] memory _tierNames,
        uint256[] memory _tierQuantities,
        uint256 _eventDate,
        address _eventOrganizer
    ) ERC721(_eventName, "EVENT") Ownable(_eventOrganizer) {
        eventName = _eventName;
        eventDescription = _eventDescription;
        maxOccupancy = _maxOccupancy;
        eventDate = _eventDate;
        eventOrganizer = _eventOrganizer;
        
        require(_tierNames.length == _tierQuantities.length, "Tier arrays length mismatch");
        
        // Initialize tiers with quantities
        for (uint256 i = 0; i < _tierNames.length; i++) {
            require(bytes(_tierNames[i]).length > 0, "Tier name cannot be empty");
            require(_tierPrices[i] > 0, "Tier price must be greater than 0");
            require(_tierQuantities[i] > 0, "Tier quantity must be greater than 0");
            
            tiers[_tierNames[i]] = Tier({
                name: _tierNames[i],
                price: _tierPrices[i],
                quantity: _tierQuantities[i], // Set quantity directly
                minted: 0,
                exists: true
            });
            
            tierNames.push(_tierNames[i]);
        }
    }
    

    
    /**
     * @dev Buy a ticket directly from the event
     * @param tierName Name of the tier to purchase
     * @param metadataURI IPFS URI for ticket metadata
     * @return tokenId The minted token ID
     */
    function buyTicket(
        string memory tierName,
        string memory metadataURI
    ) external payable validPurchase(tierName) returns (uint256) {
        // Find next available seat
        uint256 seatNumber = _findNextAvailableSeat();
        require(seatNumber > 0, "No available seats");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Mark seat as occupied
        seatOccupied[seatNumber] = true;
        
        // Create ticket
        tickets[tokenId] = Ticket({
            tokenId: tokenId,
            seatNumber: seatNumber,
            tier: tierName,
            metadataURI: metadataURI,
            owner: msg.sender,
            exists: true
        });
        
        // Update mappings
        tokenIdToSeatNumber[tokenId] = seatNumber;
        tokenIdToTier[tokenId] = tierName;
        userTickets[msg.sender].push(tokenId);
        
        // Set token URI
        _setTokenURI(tokenId, metadataURI);
        
        // Update tier minted count
        tiers[tierName].minted++;
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // Transfer payment to event organizer
        payable(eventOrganizer).transfer(msg.value);
        
        emit TicketPurchased(msg.sender, tokenId, tierName, msg.value, seatNumber);
        emit TicketMinted(tokenId, msg.sender, seatNumber, tierName, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Find the next available seat number
     * @return seatNumber The next available seat number, or 0 if none available
     */
    function _findNextAvailableSeat() internal view returns (uint256) {
        for (uint256 i = 1; i <= maxOccupancy; i++) {
            if (!seatOccupied[i]) {
                return i;
            }
        }
        return 0;
    }
    
    /**
     * @dev Mint a ticket for a specific seat and tier (organizer only)
     * @param to Address to mint the ticket to
     * @param seatNumber Seat number (1-N)
     * @param tierName Name of the tier
     * @param metadataURI IPFS URI for ticket metadata
     * @return tokenId The minted token ID
     */
    function mintTicket(
        address to,
        uint256 seatNumber,
        string memory tierName,
        string memory metadataURI
    ) external onlyEventOrganizer validSeatNumber(seatNumber) validTier(tierName) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Mark seat as occupied
        seatOccupied[seatNumber] = true;
        
        // Create ticket
        tickets[tokenId] = Ticket({
            tokenId: tokenId,
            seatNumber: seatNumber,
            tier: tierName,
            metadataURI: metadataURI,
            owner: to,
            exists: true
        });
        
        // Update mappings
        tokenIdToSeatNumber[tokenId] = seatNumber;
        tokenIdToTier[tokenId] = tierName;
        userTickets[to].push(tokenId);
        
        // Set token URI
        _setTokenURI(tokenId, metadataURI);
        
        // Update tier minted count
        tiers[tierName].minted++;
        
        // Mint NFT
        _safeMint(to, tokenId);
        
        emit TicketMinted(tokenId, to, seatNumber, tierName, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Get ticket information by token ID
     * @param tokenId The token ID
     * @return ticket The ticket information
     */
    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tickets[tokenId];
    }
    
    /**
     * @dev Get seat number by token ID
     * @param tokenId The token ID
     * @return seatNumber The seat number
     */
    function getSeatNumber(uint256 tokenId) external view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenIdToSeatNumber[tokenId];
    }
    
    /**
     * @dev Get tier by token ID
     * @param tokenId The token ID
     * @return tier The tier name
     */
    function getTicketTier(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenIdToTier[tokenId];
    }
    
    /**
     * @dev Get user's tickets
     * @param user Address of the user
     * @return userTicketIds Array of token IDs owned by the user
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }
    
    /**
     * @dev Get tier information
     * @param tierName Name of the tier
     * @return tier The tier information
     */
    function getTier(string memory tierName) external view returns (Tier memory) {
        require(tiers[tierName].exists, "Tier does not exist");
        return tiers[tierName];
    }
    
    /**
     * @dev Get all tier names
     * @return tierNames Array of all tier names
     */
    function getAllTierNames() external view returns (string[] memory) {
        return tierNames;
    }
    
    /**
     * @dev Check if seat is occupied
     * @param seatNumber The seat number to check
     * @return occupied True if seat is occupied
     */
    function isSeatOccupied(uint256 seatNumber) external view returns (bool) {
        return seatOccupied[seatNumber];
    }
    
    /**
     * @dev Get total tickets minted
     * @return totalMinted Total number of tickets minted
     */
    function getTotalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get available seats count
     * @return availableSeats Number of available seats
     */
    function getAvailableSeats() external view returns (uint256) {
        return maxOccupancy - _tokenIdCounter;
    }
    
    /**
     * @dev Set token URI
     * @param tokenId The token ID
     * @param uri The URI to set
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Get token URI
     * @param tokenId The token ID
     * @return The URI for the token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        string memory uri = _tokenURIs[tokenId];
        if (bytes(uri).length > 0) {
            return uri;
        }
        return super.tokenURI(tokenId);
    }
}
