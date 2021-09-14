const PlayBirdMansion = artifacts.require("PlayBirdMansion")

module.exports = async function(deployer) {
  let artistAddress = '0x87018F65F8F286010CF1cB84cfd356123365BaF3'
  let developerAddress = '0x85b6e0ccf7B05e9ac8E4724B31eBa0f6507c880a'
  let marketerAddress = '0x715F5AD759765Fcfc41d40470339b20D09fb1c25'
  await deployer.deploy(PlayBirdMansion, artistAddress, developerAddress, marketerAddress)
}
