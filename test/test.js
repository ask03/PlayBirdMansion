const PlayBirdMansion = artifacts.require('./PlayBirdMansion')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('PlayBirdMansion', ([deployer, user1, user2]) => {
  let token
  let name = "PlayBirdMansion"
  let symbol = "PBM"
  let supply = 6969
  let price = (10**16)*2

  beforeEach(async () => {
    token = await PlayBirdMansion.new(name, symbol, supply)
  })

  describe('testing NFT contract', () => {

    describe('success', () => {
      it('checking NFT name', async () => {
        expect(await token.name()).to.be.eq('PlayBirdMansion')
      })

      it('checking NFT symbol', async () => {
        expect(await token.symbol()).to.be.eq('PBM')
      })
    })
  })

  describe('minting tokens', () => {

    beforeEach(async () => {
      await token.flipSaleState({from: deployer})
      await token.mintBird(3, {from: user1, value: price * 3})
    })

    describe('success', () => {
      it('has the correct uri for a token', async () => {
        expect(await token.tokenURI(1)).to.be.eq("ipfs/1")
        expect(await token.tokenURI(3)).to.be.eq("ipfs/3")
      })

      it('has the correct owner for a minted token', async () => {
        expect(await token.ownerOf(1)).to.be.eq(user1)
      })

      it('token count is updated properly', async () => {
        await token.mintBird(2, {from: user2, value: price * 2})
        expect(Number(await token.totalSupply())).to.be.eq(5)
      })


    })
  })
})
