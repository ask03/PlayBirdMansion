pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlayBirdMansion is ERC721Enumerable, Ownable {
  uint256 public constant maxBirdPurchase = 69;

  uint256 public constant birdPrice = 20000000000000000; // 0.02 ETH

  uint256 public constant MAX_BIRDS = 6969;

  bool public saleActive = false;

  string public baseURI;

  constructor (string memory name, string memory symbol, uint256 maxSupply) ERC721(name, symbol) {}

  function withdraw() public onlyOwner {
      uint balance = address(this).balance;
      payable(msg.sender).transfer(balance);
  }

  function setBaseURI(string memory newURI) public onlyOwner {
      baseURI = newURI;
  }

  function _baseURI() internal view override returns (string memory) {
      return baseURI;
  }

  function reserveBirds(uint256 amount) public onlyOwner {
      require(totalSupply() + amount <= MAX_BIRDS, "Reservation would exceed max amount of birds");

      for(uint i = 0; i < amount; i++) {
          uint index = totalSupply() + 1;
          if(totalSupply() < MAX_BIRDS) {
            _safeMint(msg.sender, index);
          }
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
          uint index = totalSupply() + 1;
          if (totalSupply() < MAX_BIRDS) {
              _safeMint(msg.sender, index);
          }
      }
  }

}
