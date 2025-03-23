// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DonationPlatform {
    struct Fundraiser {
        address ngo;
        string title;
        string description;
        uint256 goal;
        uint256 raised;
        bool isActive;
        bool isVerified;
    }

    struct Update {
        string description;
        string proofUrl;
        uint256 timestamp;
    }

    mapping(uint256 => Fundraiser) public fundraisers;
    mapping(uint256 => Update[]) public updates;
    mapping(address => bool) public verifiedNGOs;
    mapping(address => bool) public auditors;

    uint256 public fundraiserCount;
    address public owner;

    event FundraiserCreated(uint256 indexed id, address indexed ngo, string title);
    event DonationMade(uint256 indexed id, address indexed donor, uint256 amount);
    event UpdatePosted(uint256 indexed id, string description);
    event FundraiserVerified(uint256 indexed id, address indexed auditor);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyVerifiedNGO() {
        require(verifiedNGOs[msg.sender], "Only verified NGOs can call this function");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Only auditors can call this function");
        _;
    }

    function createFundraiser(
        string memory _title,
        string memory _description,
        uint256 _goal
    ) external onlyVerifiedNGO returns (uint256) {
        fundraiserCount++;
        
        fundraisers[fundraiserCount] = Fundraiser({
            ngo: msg.sender,
            title: _title,
            description: _description,
            goal: _goal,
            raised: 0,
            isActive: true,
            isVerified: false
        });

        emit FundraiserCreated(fundraiserCount, msg.sender, _title);
        return fundraiserCount;
    }

    function donate(uint256 _id) external payable {
        require(_id <= fundraiserCount, "Fundraiser does not exist");
        Fundraiser storage fundraiser = fundraisers[_id];
        require(fundraiser.isActive, "Fundraiser is not active");
        require(fundraiser.isVerified, "Fundraiser is not verified");

        fundraiser.raised += msg.value;
        emit DonationMade(_id, msg.sender, msg.value);
    }

    function postUpdate(
        uint256 _id,
        string memory _description,
        string memory _proofUrl
    ) external {
        require(_id <= fundraiserCount, "Fundraiser does not exist");
        Fundraiser storage fundraiser = fundraisers[_id];
        require(msg.sender == fundraiser.ngo, "Only NGO can post updates");

        updates[_id].push(Update({
            description: _description,
            proofUrl: _proofUrl,
            timestamp: block.timestamp
        }));

        emit UpdatePosted(_id, _description);
    }

    function verifyFundraiser(uint256 _id) external onlyAuditor {
        require(_id <= fundraiserCount, "Fundraiser does not exist");
        Fundraiser storage fundraiser = fundraisers[_id];
        require(!fundraiser.isVerified, "Fundraiser already verified");

        fundraiser.isVerified = true;
        emit FundraiserVerified(_id, msg.sender);
    }

    // Admin functions
    function addNGO(address _ngo) external onlyOwner {
        verifiedNGOs[_ngo] = true;
    }

    function addAuditor(address _auditor) external onlyOwner {
        auditors[_auditor] = true;
    }
}