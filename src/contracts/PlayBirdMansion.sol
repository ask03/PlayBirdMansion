pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContextMixin.sol";

contract PlayBirdMansion is ERC721Enumerable, ContextMixin, Ownable {
  uint public constant maxBirdPurchase = 69;
  uint256 public MAX_BIRDS;
  uint256 public birdPrice = 20000000000000000; // 0.02 ETH
  bool public saleActive = false;

  constructor (string memory name, string memory symbol, uint256 maxSupply) ERC721(name, symbol) {
      MAX_BIRDS = maxSupply;
  }

  function withdraw() public onlyOwner {
      uint balance = address(this).balance;
      payable(msg.sender).transfer(balance);
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
      return string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/", toString(tokenId)));
  }

  function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        uint256 index = digits - 1;
        temp = value;
        while (temp != 0) {
            buffer[index--] = bytes1(uint8(48 + temp % 10));
            temp /= 10;
        }
        return string(buffer);
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

  function reserveBirds() public onlyOwner {
      uint supply = totalSupply();
      for (uint i = 0; i < 100; i++) {
          _safeMint(msg.sender, supply + 1);
      }
  }

  function flipSaleState() public onlyOwner {
      saleActive = !saleActive;
  }

  function mintBird(uint numberOfBirds) public payable {
      require(saleActive, "Sale is not active");
      require(numberOfBirds <= maxBirdPurchase, "Can only mint 30 birds at a time");
      require(totalSupply() + numberOfBirds <= MAX_BIRDS, "Purchase would exceed max supply of Birds");
      require(birdPrice * numberOfBirds <= msg.value, "Ether value sent is incorrect");

      for(uint i = 0; i < numberOfBirds; i++) {
        uint index = totalSupply() + 1;
        if (totalSupply() < MAX_BIRDS) {
            _safeMint(msg.sender, index);
        }
      }
  }

}
