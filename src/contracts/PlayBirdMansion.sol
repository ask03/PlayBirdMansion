pragma solidity ^0.8.7;

/* import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; */
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContextMixin.sol";

contract PlayBirdMansion is ERC721Enumerable, ContextMixin, Ownable {
  uint256 public constant maxBirdPurchase = 69;

  uint256 public MAX_BIRDS = 30;

  uint256 public birdPrice = 0.02 ether;

  bool public saleActive = false;

  address payable internal marketer;

  address payable internal developer;

  string public baseURI;

  constructor (address payable _marketer, address payable _developer) ERC721("Play Bird Mansion", "PBM") {
      marketer = _marketer;
      developer = _developer;
      reserveBirds(69);
  }

  function withdraw() public onlyOwner {
      uint256 balance = address(this).balance;
      require(balance > 0, "Contract balance is at 0");

      uint256 transferAmount = balance / 2;
      marketer.transfer(transferAmount);
      developer.transfer(transferAmount);
  }

  function setBaseURI(string memory newURI) public onlyOwner{
      baseURI = newURI;
  }

  function _baseURI() internal view override returns (string memory) {
      return baseURI;
  }

  function reserveBirds(uint256 amount) public onlyOwner {
      require(totalSupply() + amount <= MAX_BIRDS, "Reservation would exceed max supply");

      for (uint i = 0; i < amount; i++) {
          uint256 index = totalSupply() + 1;
          _safeMint(msg.sender, index);
      }
  }

  function flipSaleState() public onlyOwner {
      saleActive = !saleActive;
  }

  function mintBird(uint numberOfBirds) public payable {
      require(saleActive, "Sale is not active");
      require(numberOfBirds <= maxBirdPurchase, "Can only mint 69 birds at a time");
      require(totalSupply() + numberOfBirds <= MAX_BIRDS, "Purchase would exceed max supply of Birds");
      require(birdPrice * numberOfBirds <= msg.value, "Ether value sent is incorrect");

      for(uint i = 0; i < numberOfBirds; i++) {
        uint256 index = totalSupply() + 1;
        if (totalSupply() < MAX_BIRDS) {
            _safeMint(msg.sender, index);
        }
      }
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

    function returnMarketer() public view returns(address) {
        return marketer;
    }

    function returnDeveloper() public view returns(address) {
        return developer;
    }

}
