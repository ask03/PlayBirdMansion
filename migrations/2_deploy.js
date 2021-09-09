const PlayBirdMansion = artifacts.require("PlayBirdMansion")

module.exports = async function(deployer) {
  const name = "Play Bird Mansion"
  const symbol = "PBM"
  await deployer.deploy(PlayBirdMansion, name, symbol)
}
