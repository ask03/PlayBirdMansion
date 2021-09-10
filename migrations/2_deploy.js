const PlayBirdMansion = artifacts.require("PlayBirdMansion")

module.exports = async function(deployer, [developer, marketer]) {
  let marketerAddress = '0x87018F65F8F286010CF1cB84cfd356123365BaF3'
  let developerAddress = '0x85b6e0ccf7B05e9ac8E4724B31eBa0f6507c880a'
  await deployer.deploy(PlayBirdMansion, marketerAddress, developerAddress)
}
