const PlayBirdMansion = artifacts.require('./PlayBirdMansion')

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('PlayBirdMansion', ([deployer, artist, developer, marketer, user1, user2, user3, user4]) => {
  let token
  let price = 75
  let discount = 5
  const REFERRAL_ADDRESS = user1;

  beforeEach(async () => {
    token = await PlayBirdMansion.new(artist, developer, marketer)
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
        expect(await token.returnDeveloper()).to.be.eq(developer)
      })

      it('sale state should not be active', async () => {
        expect(await token.saleActive()).to.be.eq(false)
      })
    })
  })

  describe('minting birds', () => {

    beforeEach(async () => {
      await token.flipSaleState({from: deployer})
      await token.setBaseURI("ipfs://", {from: deployer})
      await token.mintBird(3, {from: user1, value: web3.utils.toWei((price*3).toString())})
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
        await token.mintBird(2, {from: user2, value: web3.utils.toWei((price * 2).toString())})
        expect(Number(await token.totalSupply())).to.be.eq(5)
      })

      it('should reserve birds without charging price', async () => {
        await token.reserveBirds(20, {from: deployer})
        expect(Number(await token.totalSupply())).to.be.eq(23)
      })
    })

    describe('failure', () => {
      it('should fail when trying to mint more than limit', async () => {
        await token.mintBird(21, {from: user3, value: web3.utils.toWei((price * 21).toString())}).should.be.rejectedWith(EVM_REVERT)
      })

      it('should fail when token amount is not enough', async () => {
        await token.mintBird(2, {from: user3, value: web3.utils.toWei(price.toString())}).should.be.rejectedWith(EVM_REVERT)
      })

    })
  })

  describe('minting with referrals', () => {

    beforeEach(async () => {
      await token.flipSaleState({from: deployer})
      await token.mintBird(1, {from: REFERRAL_ADDRESS, value: web3.utils.toWei(price.toString())})
      await token.mintBirdWithReferral(2, REFERRAL_ADDRESS, {from: user2, value: web3.utils.toWei(((price - discount)*2).toString())})
    })

    describe('success', () => {

      it('it should have correct totalSupply', async () => {
        expect(Number(await token.totalSupply())).to.be.eq(3)
      })

      it('referred address should have correct amount of referrals', async () => {
        await token.mintBirdWithReferral(3, REFERRAL_ADDRESS, {from: user3, value: web3.utils.toWei(((price - discount)*3).toString())})
        expect (Number(await token.numReferrals(REFERRAL_ADDRESS))).to.be.eq(2)
      })

      it('referral should pass if referral is owner of a token but never purchased', async () => {
        await token.safeTransferFrom(user2, user4, 2, {from: user2})
        await token.mintBirdWithReferral(2, user4, {from: user1, value: web3.utils.toWei((price*2).toString())})
        expect(await token.alreadyReferred(user1)).to.be.eq(true)
        expect(await token.referrableAddress(user4)).to.be.eq(true)
        expect(await token.referredToBefore(user4)).to.be.eq(true)
      })

      it('should return correct referredAddresses array length', async () => {
        await token.mintBirdWithReferral(4, user2, {from: user4, value: web3.utils.toWei((price*4).toString())})
        expect(Number(await token.getReferredAddressesLength())).to.be.eq(2)
      })

      it('should return refereedAddresses array', async () => {
        await token.mintBirdWithReferral(2, user2, {from: user4, value: web3.utils.toWei((price*2).toString())})
        await token.transferOwnership(marketer)
        let addresses = await token.getReferredAddresses({from: marketer})
        addresses.map((e) => {
          console.log(e)
        })
      })
    })

    describe('failure', () => {

      it('should fail if referred address is not a token owner', async () => {
        await token.mintBirdWithReferral(1, user3, {from: user1, value: web3.utils.toWei(price.toString())}).should.be.rejectedWith(EVM_REVERT)
      })

      it('should not allow multiple referral discounts', async () => {
        await token.mintBirdWithReferral(2, REFERRAL_ADDRESS, {from: user2, value: web3.utils.toWei(((price - discount)*2).toString())}).should.be.rejectedWith(EVM_REVERT)
      })


    })
  })

  describe('onlyOwner contract interaction', async () => {
    let artistBalance
    let developerBalance
    let marketerBalance

    beforeEach(async () => {
      await token.flipSaleState()
      await token.mintBird(5, {from: REFERRAL_ADDRESS, value: web3.utils.toWei((price * 5).toString())})
      await token.mintBirdWithReferral(5, REFERRAL_ADDRESS, {from: user2, value: web3.utils.toWei((price * 5).toString())})
      artistBalance = await web3.eth.getBalance(artist)
      developerBalance = await web3.eth.getBalance(developer)
      marketerBalance = await web3.eth.getBalance(marketer)
    })

    it('withdraw() should withdraw to the correct addresses and amounts', async () => {
      await token.withdraw()
      let balanceArtist = web3.utils.fromWei(artistBalance.toString())
      let balanceDeveloper = web3.utils.fromWei(developerBalance.toString())
      let balanceMarketer = web3.utils.fromWei(marketerBalance.toString())
      let newBalanceArtist = Number(balanceArtist) + 337.5
      let newBalanceDeveloper = Number(balanceDeveloper) + 337.5
      let newBalanceMarketer = Number(balanceMarketer) + 75
      expect(await web3.eth.getBalance(artist)).to.be.eq(web3.utils.toWei(newBalanceArtist.toString()))
      expect(await web3.eth.getBalance(developer)).to.be.eq(web3.utils.toWei(newBalanceDeveloper.toString()))
      expect(await web3.eth.getBalance(marketer)).to.be.eq(web3.utils.toWei(newBalanceMarketer.toString()))
    })


  })

})
