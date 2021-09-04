import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Web3 from 'web3';
import PlayBirdMansion from '../abis/PlayBirdMansion.json'

class App extends Component {

    async componentDidMount() {
      await this.loadBlockChainData(this.props.dispatch)
    }

    async loadBlockChainData(dispatch) {
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

    async mintBird(e) {
      e.preventDefault()
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.mintBird(1).send({ value: (10**16)*2, from: this.state.account })
        } catch (e) {
          console.log('Error, mintBird: ', e)
        }
      }
    }

    async flipSaleStatus(e) {
      e.preventDefault()
      if(this.state.token !== 'undefined') {
        try {
          await this.state.token.methods.flipSaleState().send({from: this.state.account})
        } catch (e) {
          console.log('Error, flipSaleState: ', e)
        }
      }
    }

    constructor(props) {
      super(props)
      this.state = {
        web: 'undefined',
        account: '',
        token: null,
        balance: 0
      }
    }

    render() {
      return (
        <div className="text-monospace">
          <button type='submit' className='btn btn-primary' onClick={(e) => this.mintBird(e)}>MINT</button>
          <button type='submit' className='btn btn-primary' onClick={(e) => this.flipSaleStatus(e)}>FlipSaleStatus</button>
        </div>
      )
    }

}

export default App;
