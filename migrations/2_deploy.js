const PlayBirdMansionToken = artifacts.require("PlayBirdMansionToken")
const PlayBirdMansionMinter = artifacts.require("PlayBirdMansionMinter")

module.exports = async function(deployer) {
  await deployer.deploy(PlayBirdMansionToken)
  const token = await PlayBirdMansionToken.deployed()

  await deployer.deploy(PlayBirdMansionMinter, token.address)
  const minter = await PlayBirdMansionMinter.deployed()

  await token._transferOwnership(minter.address)
}
