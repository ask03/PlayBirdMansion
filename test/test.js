const PlayBirdMansionToken = artifacts.require('./PlayBirdMansionToken')
const PlayBirdMansionMinter = artifacts.require('./PlayBirdMansionMinter')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('PlayBirdMansionToken', ([deployer, user1, user2]) => {
  let token

  beforeEach(async () => {
    token = await PlayBirdMansionToken.new()
  })

  describe('testing NFT contract', () => {

    describe('success', () => {
      it('checking NFT name', async () => {
        expect(await token.name()).to.be.eq('Play Bird Mansion')
      })

      it('checking NFT symbol', async () => {
        expect(await token.symbol()).to.be.eq('PBM')
      })
    })
  })

  describe('minting tokens', () => {
    let uri = "https://ipfs.io/ipfs/QmQEVVLJUR1WLN15S49rzDJsSP7za9DxeqpUzWuG4aondg"

    beforeEach(async () => {
      await token.mint(user1, 1, uri, {from: deployer})
    })

    describe('success', () => {
      it('has the correct uri for a token', async () => {
        expect(await token.tokenURI(1)).to.be.eq(uri)
      })
    })
  })
})
