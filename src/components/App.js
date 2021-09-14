import React, { Component } from 'react';
import Web3 from 'web3';
import PlayBirdMansion from '../abis/PlayBirdMansion.json'

class App extends Component {

    async componentDidMount() {
      await this.loadBlockChainData()
      await this.checkReferralStatus()
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
        } catch(e) {
          console.log('Error', e)
          window.alert('Please connect to Polygon Network')
        }


      } else {
        window.alert('Please install MetaMask')
      }

    }

    async mintBirds(numberOfBirds, amount) {
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.mintBird(numberOfBirds).send({ value: amount, from: this.state.account })
        } catch (e) {
          console.log('Error, mintBird: ', e)
        }
      }
    }

    async mintBirdsWithReferral(numberOfBirds, amount, referralAddress) {
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.mintBirdWithReferral(numberOfBirds, referralAddress).send({ value: amount, from: this.state.account})
        } catch (e) {
          console.log('Error, mintBirdWithReferral: ', e)
        }
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
      }
    }

    render() {
      return (

        <main role="main" className="col-lg-12 d-flex justify-content-center text-white ">
          <div className="content mr-auto ml-auto">
              <div>
                  <br></br>
                  (each bird will cost 75 MATIC (Polygon) + gas fees)
                  <br></br>
                  (can mint up to 20 birds per time)
                  <br></br>
                  (use a referral for a 5 MATIC discount per bird!)
                  <br></br>
                  (referral can only be used once)
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.amountOfBirds.value
                    let total = amount * 75// convert to wei
                    let referralTransaction
                    let mintTransaction

                    if(this.referralAddress.value !== '') {
                      total = total - (5*amount)
                      total = total * (10**18)
                      referralTransaction = this.mintBirdsWithReferral(amount, total, this.referralAddress.value)
                      console.log(referralTransaction)
                      this.setState({referralTransaction: referralTransaction})
                    } else {
                      total = total * (10**18)
                      mintTransaction = this.mintBirds(amount, total)
                      console.log(mintTransaction)
                      this.setState({mintTransaction: mintTransaction})
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
                        placeholder="Referral Address 0x..."
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
              { this.state.account !== '' ? "Web3 is Connected" : <button type='submit' className='btn btn-primary' onClick={(e) => this.connectWeb3(e)}>Connect Web3</button> }

              <br></br>
              <h6>Account:</h6>
              <h6><span>{this.state.account}</span></h6>
            </div>
          </div>
        </main>

    );
  }

}

export default App;
