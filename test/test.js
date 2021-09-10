const PlayBirdMansion = artifacts.require('./PlayBirdMansion')

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('PlayBirdMansion', ([deployer, marketer, user1, user2, user3]) => {
  let token
  let price = (10**16) * 2

  beforeEach(async () => {
    token = await PlayBirdMansion.new(marketer, deployer)
  })

  describe('testing NFT contract', () => {

    describe('success', () => {
      it('checking NFT name', async () => {
        expect(await token.name()).to.be.eq('Play Bird Mansion')
      })

      it('checking NFT symbol', async () => {
        expect(await token.symbol()).to.be.eq('PBM')
      })

      it('has correct marketer address', async () => {
        expect(await token.returnMarketer()).to.be.eq(marketer)
      })

      it('has correct developer address', async () => {
        expect(await token.returnDeveloper()).to.be.eq(deployer)
      })

    })
  })

  describe('minting tokens', () => {

    beforeEach(async () => {
      await token.flipSaleState({from: deployer})
      await token.setBaseURI("ipfs://", {from: deployer})
      await token.mintBird(3, {from: user1, value: price * 3})
    })

    describe('success', () => {
      it('has the correct baseURI', async () => {
        expect(await token.baseURI()).to.be.eq("ipfs://")
      })

      it('has the correct uri for a token', async () => {
        expect(await token.tokenURI(1)).to.be.eq("ipfs://1")
        expect(await token.tokenURI(3)).to.be.eq("ipfs://3")
      })

      it('has the correct owner for a minted token', async () => {
        expect(await token.ownerOf(1)).to.be.eq(user1)
      })

      it('token count is updated properly', async () => {
        await token.mintBird(2, {from: user2, value: price * 2})
        expect(Number(await token.totalSupply())).to.be.eq(5)
      })

    })

    describe('failure', () => {
      it('should fail when trying to mint more than limit', async () => {
        await token.mintBird(70, {from: user3, value: price * 70}).should.be.rejectedWith(EVM_REVERT)
      })

      it('should fail when token amount is not enough', async () => {
        await token.mintBird(2, {from: user3, value: price}).should.be.rejectedWith(EVM_REVERT)
      })

      it('should fail when trying to mint more than max supply', async () => {
        await token.reserveBirds(27, {from: deployer, gas:5000000})
        await token.mintBird(1, {from: user3, value: price}).should.be.rejectedWith(EVM_REVERT)
      })

      it('should fail when trying to reserve more than max supply', async () => {
        await token.reserveBirds(28, {from: deployer, gas:5000000}).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })
})
