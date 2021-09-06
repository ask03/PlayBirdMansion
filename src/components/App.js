import React, { Component } from 'react';
import Web3 from 'web3';
import PlayBirdMansion from '../abis/PlayBirdMansion.json'

class App extends Component {

    async componentDidMount() {
      await this.loadBlockChainData()
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
          window.alert('Please login with MetaMask')
        }

        try {
          const token = new web3.eth.Contract(PlayBirdMansion.abi, PlayBirdMansion.networks[netId].address)
          this.setState({ token: token })
        } catch(e) {
          console.log('Error', e)
          window.alert('Contracts not deployed to current network')
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


    async connectWeb3(e) {
      e.preventDefault()
      if(typeof window.ethereum != 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        this.setState({account: account})
      } else {
        window.alert("Please install MetaMask")
      }
    }

    async showConnectWeb3Button() {
      if(window.ethereum) {
        await window.ethereum.send('eth_requestAccounts')
        return true
      } else {
        return false
      }
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
                  How many birds to mint?
                  <br></br>
                  (each bird costs 0.02 ETH + gas fees)
                  <br></br>
                  (can mint upto 69 birds per account)
                  <br></br>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.amountOfBirds.value
                    let total = amount * 10**16*2// convert to wei
                    this.mintBirds(amount, total)
                  }}>
                  <div className='form-group mr-sm-2'>
                  <br></br>
                    <input
                      id='numBirds'
                      step='1'
                      type='number'
                      className="form-control form-control-md"
                      placeholder="amount..."
                      ref={(input) => { this.amountOfBirds = input }}
                    />
                  </div>
                  <button type='submit' className='btn btn-primary'>MINT</button>
                </form>
              </div>
            <div>
              { this.showConnectWeb3Button() ? "Web3 is Connected!" : <button type='submit' className='btn btn-primary' onClick={(e) => this.connectWeb3(e)}>Connect Web3</button> }
          </div>
          </div>
        </main>
    );
  }

}

export default App;
