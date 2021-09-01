pragma solidity ^0.8.7;

import '@0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol';
import '@0xcert/ethereum-erc721/src/contracts/ownership/ownable.sol';

contract PlayBirdMansionToken is NFTokenMetadata, Ownable {

  constructor () {
    nftName = "Play Bird Mansion";
    nftSymbol = "PBM";
  }

  function mint(address _to, uint256 _tokenId, string calldata _uri) external onlyOwner{
    super._mint(_to, _tokenId);
    super._setTokenUri(_tokenId, _uri);
  }

  function _transferOwnership(address newOwner) public onlyOwner {
    transferOwnership(newOwner);
  }
}
