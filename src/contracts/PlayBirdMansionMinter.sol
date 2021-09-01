pragma solidity ^0.8.7;

import './PlayBirdMansionToken';

contract PlayBirdMansionMinter {

  PlayBirdMansionToken private token;
  uint256 private constant price = 20000000000000000;
  uint256 public tokenId;

  event Purchase(address indexed user, uint256 tokenId);

  constructor(PlayBirdMansionToken _token) {
    token = _token;
  }

  function purchase(string calldata _uri) external payable {
    require(msg.value >= price);
    require(msg.sender != address(0));

    tokenId = tokenId.add(1);
    token.mint(msg.sender, tokenId, _uri);

    emit Purchase(msg.sender, tokenId);
  }
}
