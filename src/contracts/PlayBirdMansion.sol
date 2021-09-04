pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlayBirdMansion is ERC721Enumerable, Ownable {
  uint public constant maxBirdPurchase = 30;
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

  function _baseURI() internal view override returns (string memory) {
      return "ipfs://QmPPWpqHwCUpgbVFP7JYRmNJh8YYWUpQVd9V6t7CA89oXs/";
  }

  function reserveBirds() public onlyOwner {
      uint supply = totalSupply();
      uint i;
      for (i = 0; i < 100; i++) {
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
