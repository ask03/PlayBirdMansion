import React, { Component } from 'react';
import Web3 from 'web3';
import PlayBirdMansion from '../abis/PlayBirdMansion.json'

class App extends Component {

    async componentDidMount() {
      await this.loadBlockChainData()
      await this.checkReferralStatus()
      await this.loadTokenData()
      window.ethereum.on('accountsChanged', (accounts) => {
        let currentAccount = this.state.account
        if(accounts.length === 0) {
          window.alert("Please connect to MetaMask")
        } else if (accounts[0] !== currentAccount) {
          currentAccount = accounts[0]
          this.setState({account: currentAccount})
        }
        window.location.reload()
      })
      window.ethereum.on('chainChanged', (chainId) => {
        if(chainId === '0x89') {
          this.setState({connection : true})
        }
        window.location.reload()
      })
      window.ethereum.on('disconnect', (error) => {
        window.ethereum.request({ method: 'eth_requestAccounts'})
      })
    }

    async loadBlockChainData() {
      if(typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()

        if(typeof accounts[0] !== 'undefined') {
          const balance = await web3.eth.getBalance(accounts[0])
          this.setState({ account: accounts[0], balance: balance, web3: web3 })
        } else {
          window.alert('Please connect your MetaMask account')
        }

        try {
          const token = new web3.eth.Contract(PlayBirdMansion.abi, PlayBirdMansion.networks[netId].address)
          this.setState({ token: token })
          this.setState({ connection: true })
          await this.loadTokenData()
        } catch(e) {
          console.log('Error', e)
          window.alert('Please connect MetaMask to Polygon Network')
        }


      } else {
        window.alert('Please install MetaMask')
      }

    }

    async mintBirds(numberOfBirds, amount) {
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.mintBird(numberOfBirds).send({ value: amount, from: this.state.account })
          window.location.reload()
        } catch (e) {
          console.log('Error, mintBird: ', e)
        }
      }
    }

    async mintBirdsWithReferral(numberOfBirds, amount, referralAddress) {
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.mintBirdWithReferral(numberOfBirds, referralAddress).send({ value: amount, from: this.state.account})
          window.location.reload()
        } catch (e) {
          console.log('Error, mintBirdWithReferral: ', e)
        }
      }
    }

    async loadTokenData() {
      if(this.state.token !== null) {
        let tokens = await this.state.token.methods.totalSupply().call()
        let tokensLeft =  6969 - tokens
        this.setState({ tokensLeft: tokensLeft })
      }
    }

    async checkReferralStatus() {
      let result = false
      if(this.state.token !== null) {
        if(this.state.account !== '') {
          result = await this.state.token.methods.alreadyReferred(this.state.account).call()
          this.setState({ referStatus: result })
        }
      }
      return result
    }

    async connectWeb3(e) {
      e.preventDefault()
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        this.setState({account: account})
    }


    constructor(props) {
      super(props)
      this.state = {
        web3: 'undefined',
        account: '',
        token: null,
        balance: 0,
        referralAddress: {
          value: ''
        },
        tokensLeft: 0,
        connection: false
      }
    }

    render() {
      return (


        <main role="main" className="col-lg-12 d-flex justify-content-center text-white ">
          <div className="content mr-auto ml-auto">
              <div>
                  <br></br>
                  (minting a bird will cost 30 Matics (Polygon Network))
                  <br></br>
                  (can mint up to 20 birds per transaction)
                  <br></br>
                  (use a referral for a 4 MATIC discount per mint)
                  <form onSubmit={async(e) => {
                    e.preventDefault()
                    let amount = this.amountOfBirds.value
                    let total = amount * 30// convert to wei

                    if(this.referralAddress.value !== '') {
                      if(this.referralAddress.value === this.state.account) {
                          window.alert("Cannot refer self")
                      } else if (this.referralAddress.value === '0x0000000000000000000000000000000000000000') {
                          window.alert("Cannot be zero address")
                      } else {
                          let result = await this.state.token.methods.referrableAddress(this.referralAddress.value).call()
                          let resultTwo = await this.state.token.methods.balanceOf(this.referralAddress.value).call()
                          if (result === true || resultTwo > 0) {
                            total = total - (4*amount)
                            total = total * (10**18)
                            this.mintBirdsWithReferral(amount, total, this.referralAddress.value)
                          } else {
                            window.alert("invalid referral address")
                          }

                      }

                      this.referralAddress.value = ''

                    } else {
                      total = total * (10**18)
                      this.mintBirds(amount, total)
                    }


                  }}>
                  <div className='form-group mr-sm-2'>
                  <br></br>
                    <input
                      id='numBirds'
                      step='1'
                      type='number'
                      max='20'
                      className="form-control form-control-md"
                      placeholder="How many birds to mint?"
                      ref={(input) => { this.amountOfBirds = input }}
                    />
                  <br></br>

                    { this.state.referStatus ? "" :
                      <input
                        id='referral'
                        maxLength='42'
                        minLength='42'
                        className="form-control form-control-md"
                        placeholder="(Optional) referral address 0x..."
                        ref={(input) => { this.referralAddress = input }}
                      />
                    }
                  </div>
                  <br></br>
                  <button type='submit' className='btn btn-primary'>MINT</button>
                </form>
              </div>
            <div>
              <br></br>
              { this.state.account !== '' ? "Web3 Connected" : <button type='submit' className='btn btn-primary' onClick={(e) => this.connectWeb3(e)}>Connect Web3</button> }

              <br></br>
              Account:
              <h6><span>{this.state.account}</span></h6>
              <br></br>
              <br></br>
              <br></br>
              {this.state.connection ? <h3>{(this.state.tokensLeft).toString()}/6969 Birds Remaining</h3> : <h3>Please connect MetaMask to Polygon Network</h3> }
            </div>
          </div>
        </main>

    );
  }

}

export default App;
