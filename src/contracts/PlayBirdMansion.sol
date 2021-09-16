  pragma solidity ^0.8.7;

  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "@openzeppelin/contracts/utils/Address.sol";
  import "./ContextMixin.sol";

  contract PlayBirdMansion is ERC721Enumerable, ContextMixin, Ownable {

    using Address for address;

    uint256 public constant MAX_BIRDS = 6969;

    uint256 public constant maxBirdPurchase = 20;

    uint256 private birdPrice = 35 ether;

    uint256 private referralDiscount = 5 ether;

    bool public saleActive = false;

    address payable internal artist;

    address payable internal developer;

    address payable internal marketer;

    string internal baseURI;

    mapping(address => bool) public alreadyReferred;  // user has used referral
    mapping(address => bool) public referrableAddress;
    mapping(address => bool) public referredToBefore;
    mapping(address => uint256) public numReferrals;  // number of referrals an address has (used for contest)

    address[] private referredAddresses; // used for calculations in referral contest

    bool private reentrancyLock = false;

    modifier reentrancyGuard {
        if (reentrancyLock) {
            revert();
        }
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    constructor (address payable _artist, address payable _developer, address payable _marketer) ERC721("Play Bird Mansion", "PBM") {
        artist = _artist;
        developer = _developer;
        marketer = _marketer;
    }


    function withdraw() public onlyOwner reentrancyGuard{
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract balance is at 0");

        uint256 marketerTransfer = balance / 10;
        marketer.transfer(marketerTransfer);
        balance = balance - marketerTransfer;

        uint256 transferAmount = balance / 2;
        artist.transfer(transferAmount);
        developer.transfer(transferAmount);
    }

    function setBaseURI(string memory newURI) external onlyOwner{
        baseURI = newURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function reserveBirds(uint256 amount) external onlyOwner reentrancyGuard {
        require(totalSupply() + amount <= MAX_BIRDS, "Reservation would exceed max supply");
        require(amount <= maxBirdPurchase, "can only reserve maximum 20 per time");

        for (uint i = 0; i < amount; i++) {
            uint256 index = totalSupply();
            _safeMint(msg.sender, index + 1);
        }
    }

    function flipSaleState() external onlyOwner {
        saleActive = !saleActive;
    }

    function mintBird(uint numberOfBirds) external payable reentrancyGuard {
        require(saleActive, "Sale is not active");
        require(numberOfBirds <= maxBirdPurchase, "Can only mint 20 birds at a time");
        require(totalSupply() + numberOfBirds <= MAX_BIRDS, "Purchase would exceed max supply of Birds");
        require(birdPrice * numberOfBirds <= msg.value, "Matic value sent is incorrect");

        referrableAddress[msg.sender] = true;

        for(uint i = 0; i < numberOfBirds; i++) {
            uint256 index = totalSupply();
            _safeMint(msg.sender, index + 1);
        }

    }

    function mintBirdWithReferral(uint numberOfBirds, address referral) external payable reentrancyGuard {
        require(saleActive, "Sale is not active");
        require(numberOfBirds <= maxBirdPurchase, "Can only mint 20 birds at a time");
        require(totalSupply() + numberOfBirds <= MAX_BIRDS, "Purchase would exceed max supply of Birds");
        require(validReferral(referral), "Referral is not valid: ");

        uint256 price = birdPrice - referralDiscount;
        require(price * numberOfBirds <= msg.value, "Ether value sent is incorrect");

        if(!referredToBefore[referral]) {
          referredToBefore[referral] = true;
          referrableAddress[referral] = true;
          referredAddresses.push(referral);
        }

        alreadyReferred[msg.sender] = true;
        numReferrals[referral] = numReferrals[referral] + 1;

        for(uint i = 0; i < numberOfBirds; i++) {
          uint256 index = totalSupply();
          _safeMint(msg.sender, index + 1);
        }


    }

    function validReferral(address referral) private view returns (bool) {
        require(validAddress(referral), "Referral address is not a valid wallet address");
        require(referral != msg.sender, "Cannot refer self");
        require(!(alreadyReferred[msg.sender]), "User has already used referral");
        require(balanceOf(referral) > 0 || referrableAddress[referral], "Referral address never purchased a token, or isnt a current owner");
        return true;
    }

    function validAddress(address referral) private view returns (bool) {
        if(!(referral.isContract())
            && (referral != address(0))
          ){
              return true;
          }

        return false;
    }

    function updatePrice(uint256 newPrice) public onlyOwner {
        birdPrice = newPrice;
    }

    function updateDiscount(uint256 newDc) public onlyOwner {
        referralDiscount = newDc;
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }

  /**
   * Override isApprovedForAll to auto-approve OS's proxy contract
   */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
      // if OpenSea's ERC721 Proxy Address is detected, auto-return true
        if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
            return true;
        }

        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
    }

    function getReferredAddressesLength() external view onlyOwner returns(uint256) {
        uint256 length = referredAddresses.length;
        return length;
    }

    function getReferredAddresses() external view onlyOwner returns (address[] memory) {
        address[] storage addresses = referredAddresses;
        return addresses;
    }

  }
