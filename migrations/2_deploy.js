const PlayBirdMansion = artifacts.require("PlayBirdMansion")

module.exports = async function(deployer) {
  const name = "PlayBirdMansion"
  const symbol = "PBM"
  const MAX_BIRDS = 6969
  await deployer.deploy(PlayBirdMansion, name, symbol, MAX_BIRDS)
}
